import { Injectable, UnauthorizedException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { User, UserType } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken, TokenType } from './entities/verification-token.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../shared/services/email.service';
import { USER_SELECT_FIELDS } from '../users/constants/user-select.fields';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../users/entities/user.entity';

export type UserResponse = Omit<User, 'passwordHash'>;

interface TokenPayload {
  sub: string;
  email: string;
  userType: UserType;
  organizationId?: string;
}

interface CreatorUser {
  id: string;
  userType: UserType;
  organizationId?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(VerificationToken)
    private verificationTokenRepository: Repository<VerificationToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: USER_SELECT_FIELDS
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<UserResponse> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await argon2.hash(registerDto.password);

    const user = this.usersRepository.create({
      ...registerDto,
      passwordHash,
      isEmailVerified: false
    });

    await this.usersRepository.save(user);
    await this.sendVerificationEmail(user);

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      select: { ...USER_SELECT_FIELDS, passwordHash: true, isFirstLogin: true, status: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credențiale invalide');
    }

    // Verificăm status-ul utilizatorului
    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Contul este blocat. Contactați administratorul');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new ForbiddenException('Contul este inactiv. Contactați administratorul');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credențiale invalide');
    }

    const tokens = await this.generateTokens(user);
    
    // Dacă este prima autentificare, actualizăm flag-ul
    if (user.isFirstLogin) {
      await this.usersRepository.update(user.id, { isFirstLogin: false });
    }

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        ...userWithoutPassword,
        isFirstLogin: user.isFirstLogin
      }
    };
  }

  private async generateTokens(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      userType: user.userType as UserType,
      organizationId: user.organizationId
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.save({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      isRevoked: false
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { 
        token: refreshTokenDto.refreshToken,
        isRevoked: false
      },
      relations: ['user']
    });

    if (!refreshTokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > refreshTokenEntity.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Revocă vechiul refresh token
    await this.refreshTokenRepository.update(refreshTokenEntity.id, { isRevoked: true });

    // Generează noi token-uri
    const tokens = await this.generateTokens(refreshTokenEntity.user);

    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    };
  }

  async logout(userId: string): Promise<void> {
    // Revocă toate refresh token-urile utilizatorului
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generează token de resetare
    const token = uuidv4();
    const expiresAt = new Date();
    const expirationHours = this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRATION', 24);
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    await this.verificationTokenRepository.save({
      userId: user.id,
      token,
      type: TokenType.PASSWORD_RESET,
      expiresAt,
      isUsed: false
    });

    // Trimite email cu link-ul de resetare
    await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenEntity = await this.verificationTokenRepository.findOne({
      where: {
        token: dto.token,
        type: TokenType.PASSWORD_RESET,
        isUsed: false
      },
      relations: ['user']
    });

    if (!tokenEntity || new Date() > tokenEntity.expiresAt) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Hash-uiește noua parolă
    const passwordHash = await argon2.hash(dto.newPassword);

    // Actualizează parola utilizatorului
    await this.usersRepository.update(tokenEntity.userId, { passwordHash });

    // Marchează token-ul ca folosit
    await this.verificationTokenRepository.update(tokenEntity.id, { isUsed: true });
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    const token = uuidv4();
    const expiresAt = new Date();
    const expirationHours = this.configService.get<number>('EMAIL_VERIFICATION_TOKEN_EXPIRATION', 72);
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    await this.verificationTokenRepository.save({
      userId: user.id,
      token,
      type: TokenType.EMAIL_VERIFICATION,
      expiresAt,
      isUsed: false
    });

    await this.emailService.sendVerificationEmail(user.email, token);
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenEntity = await this.verificationTokenRepository.findOne({
      where: {
        token,
        type: TokenType.EMAIL_VERIFICATION,
        isUsed: false
      }
    });

    if (!tokenEntity || new Date() > tokenEntity.expiresAt) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Marchează emailul ca verificat
    await this.usersRepository.update(tokenEntity.userId, { isEmailVerified: true });

    // Marchează token-ul ca folosit
    await this.verificationTokenRepository.update(tokenEntity.id, { isUsed: true });
  }

  async createOrgAdmin(registerDto: RegisterDto): Promise<{ user: UserResponse; tempPassword: string }> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const tempPassword = Math.random().toString(36).slice(-8); // Generăm o parolă temporară de 8 caractere
    const passwordHash = await argon2.hash(tempPassword);

    const user = this.usersRepository.create({
      ...registerDto,
      userType: UserType.ORGADMIN,
      passwordHash,
      isEmailVerified: false,
      isFirstLogin: true // Adăugăm flag-ul pentru prima autentificare
    });

    await this.usersRepository.save(user);

    const { passwordHash: _, ...result } = user;
    return { 
      user: result,
      tempPassword 
    };
  }

  async createUser(registerDto: RegisterDto, creator: CreatorUser): Promise<UserResponse> {
    if (creator.userType !== UserType.SUPERADMIN && creator.organizationId !== registerDto.organizationId) {
      throw new ForbiddenException('You can only create users for your organization');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (creator.userType === UserType.ORGADMIN && 
        ![UserType.ADMIN, UserType.COLLABORATOR, UserType.EMPLOYEE].includes(registerDto.userType as UserType)) {
      throw new ForbiddenException('OrgAdmin can only create ADMIN, COLLABORATOR or EMPLOYEE users');
    }

    const passwordHash = await argon2.hash(Math.random().toString(36));

    const user = this.usersRepository.create({
      ...registerDto,
      passwordHash,
      isEmailVerified: false
    });

    await this.usersRepository.save(user);
    await this.requestPasswordReset({ email: user.email });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async updateUser(userId: string, updateUserDto: any, creator: any): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifică permisiunile
    if (creator.userType !== UserType.SUPERADMIN && creator.organizationId !== user.organizationId) {
      throw new ForbiddenException('You can only update users from your organization');
    }

    // Actualizează utilizatorul
    await this.usersRepository.update(userId, updateUserDto);

    // Returnează utilizatorul actualizat
    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
      select: USER_SELECT_FIELDS
    });

    return updatedUser;
  }

  async deleteUser(userId: string, creator: CreatorUser): Promise<void> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId },
      relations: ['organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verificăm dacă creatorul are permisiunea să șteargă utilizatorul
    if (creator.userType !== UserType.SUPERADMIN) {
      if (creator.organizationId !== user.organizationId) {
        throw new ForbiddenException('You can only delete users from your organization');
      }
      if (user.userType === UserType.ORGADMIN) {
        throw new ForbiddenException('Only SUPERADMIN can delete organization admins');
      }
    }

    // Ștergem mai întâi toate refresh token-urile asociate
    await this.refreshTokenRepository.delete({ userId });
    
    // Ștergem toate verification token-urile asociate
    await this.verificationTokenRepository.delete({ userId });

    // Acum putem șterge utilizatorul în siguranță
    await this.usersRepository.remove(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordHash = await argon2.hash(dto.newPassword);
    await this.usersRepository.update(userId, { 
      passwordHash,
      isFirstLogin: false 
    });

    // Revocăm toate token-urile de refresh pentru a forța reautentificarea
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  async resetAdminPassword(userId: string, creator: CreatorUser): Promise<{ tempPassword: string }> {
    // Verifică dacă utilizatorul există
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['organization']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifică permisiunile
    if (creator.userType !== UserType.SUPERADMIN) {
      if (creator.userType === UserType.ORGADMIN && user.organizationId !== creator.organizationId) {
        throw new ForbiddenException('You can only reset passwords for users in your organization');
      }
    }

    // Generează o parolă temporară
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await argon2.hash(tempPassword);

    // Actualizează parola și setează isFirstLogin = true
    await this.usersRepository.update(userId, { 
      passwordHash,
      isFirstLogin: true 
    });

    // Revocă toate token-urile de refresh pentru a forța reautentificarea
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true }
    );

    return { tempPassword };
  }
} 