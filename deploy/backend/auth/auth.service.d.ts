import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserType } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../shared/services/email.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../users/entities/user.entity';
export type UserResponse = Omit<User, 'passwordHash'>;
interface CreatorUser {
    id: string;
    userType: UserType;
    organizationId?: string;
}
export declare class AuthService {
    private usersRepository;
    private refreshTokenRepository;
    private verificationTokenRepository;
    private jwtService;
    private emailService;
    private configService;
    constructor(usersRepository: Repository<User>, refreshTokenRepository: Repository<RefreshToken>, verificationTokenRepository: Repository<VerificationToken>, jwtService: JwtService, emailService: EmailService, configService: ConfigService);
    getCurrentUser(userId: string): Promise<UserResponse>;
    register(registerDto: RegisterDto): Promise<UserResponse>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: {
            isFirstLogin: boolean | undefined;
            id: string;
            organizationId: string;
            organization: import("../organizations/entities/organization.entity").Organization;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            personalCode: string;
            userType: UserType;
            status: UserStatus;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            refreshTokens: RefreshToken[];
            verificationTokens: VerificationToken[];
        };
    }>;
    private generateTokens;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string): Promise<void>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    private sendVerificationEmail;
    verifyEmail(token: string): Promise<void>;
    createOrgAdmin(registerDto: RegisterDto): Promise<{
        user: UserResponse;
        tempPassword: string;
    }>;
    createUser(registerDto: RegisterDto, creator: CreatorUser): Promise<UserResponse>;
    updateUser(userId: string, updateUserDto: any, creator: any): Promise<any>;
    deleteUser(userId: string, creator: CreatorUser): Promise<void>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<void>;
    resetAdminPassword(userId: string, creator: CreatorUser): Promise<{
        tempPassword: string;
    }>;
}
export {};
