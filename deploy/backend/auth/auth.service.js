"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const argon2 = require("argon2");
const uuid_1 = require("uuid");
const user_entity_1 = require("../users/entities/user.entity");
const refresh_token_entity_1 = require("./entities/refresh-token.entity");
const verification_token_entity_1 = require("./entities/verification-token.entity");
const email_service_1 = require("../shared/services/email.service");
const user_select_fields_1 = require("../users/constants/user-select.fields");
const config_1 = require("@nestjs/config");
const user_entity_2 = require("../users/entities/user.entity");
let AuthService = class AuthService {
    constructor(usersRepository, refreshTokenRepository, verificationTokenRepository, jwtService, emailService, configService) {
        this.usersRepository = usersRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.configService = configService;
    }
    async getCurrentUser(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: user_select_fields_1.USER_SELECT_FIELDS
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async register(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
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
    async login(loginDto) {
        const user = await this.usersRepository.findOne({
            where: { email: loginDto.email },
            select: { ...user_select_fields_1.USER_SELECT_FIELDS, passwordHash: true, isFirstLogin: true, status: true }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credențiale invalide');
        }
        if (user.status === user_entity_2.UserStatus.BLOCKED) {
            throw new common_1.ForbiddenException('Contul este blocat. Contactați administratorul');
        }
        if (user.status === user_entity_2.UserStatus.INACTIVE) {
            throw new common_1.ForbiddenException('Contul este inactiv. Contactați administratorul');
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, loginDto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credențiale invalide');
        }
        const tokens = await this.generateTokens(user);
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
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            userType: user.userType,
            organizationId: user.organizationId
        };
        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = (0, uuid_1.v4)();
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
    async refresh(refreshTokenDto) {
        const refreshTokenEntity = await this.refreshTokenRepository.findOne({
            where: {
                token: refreshTokenDto.refreshToken,
                isRevoked: false
            },
            relations: ['user']
        });
        if (!refreshTokenEntity) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (new Date() > refreshTokenEntity.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token has expired');
        }
        await this.refreshTokenRepository.update(refreshTokenEntity.id, { isRevoked: true });
        const tokens = await this.generateTokens(refreshTokenEntity.user);
        return {
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken
        };
    }
    async logout(userId) {
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
    }
    async requestPasswordReset(dto) {
        const user = await this.usersRepository.findOne({
            where: { email: dto.email }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        const expirationHours = this.configService.get('PASSWORD_RESET_TOKEN_EXPIRATION', 24);
        expiresAt.setHours(expiresAt.getHours() + expirationHours);
        await this.verificationTokenRepository.save({
            userId: user.id,
            token,
            type: verification_token_entity_1.TokenType.PASSWORD_RESET,
            expiresAt,
            isUsed: false
        });
        await this.emailService.sendPasswordResetEmail(user.email, token);
    }
    async resetPassword(dto) {
        const tokenEntity = await this.verificationTokenRepository.findOne({
            where: {
                token: dto.token,
                type: verification_token_entity_1.TokenType.PASSWORD_RESET,
                isUsed: false
            },
            relations: ['user']
        });
        if (!tokenEntity || new Date() > tokenEntity.expiresAt) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const passwordHash = await argon2.hash(dto.newPassword);
        await this.usersRepository.update(tokenEntity.userId, { passwordHash });
        await this.verificationTokenRepository.update(tokenEntity.id, { isUsed: true });
    }
    async sendVerificationEmail(user) {
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date();
        const expirationHours = this.configService.get('EMAIL_VERIFICATION_TOKEN_EXPIRATION', 72);
        expiresAt.setHours(expiresAt.getHours() + expirationHours);
        await this.verificationTokenRepository.save({
            userId: user.id,
            token,
            type: verification_token_entity_1.TokenType.EMAIL_VERIFICATION,
            expiresAt,
            isUsed: false
        });
        await this.emailService.sendVerificationEmail(user.email, token);
    }
    async verifyEmail(token) {
        const tokenEntity = await this.verificationTokenRepository.findOne({
            where: {
                token,
                type: verification_token_entity_1.TokenType.EMAIL_VERIFICATION,
                isUsed: false
            }
        });
        if (!tokenEntity || new Date() > tokenEntity.expiresAt) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        await this.usersRepository.update(tokenEntity.userId, { isEmailVerified: true });
        await this.verificationTokenRepository.update(tokenEntity.id, { isUsed: true });
    }
    async createOrgAdmin(registerDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await argon2.hash(tempPassword);
        const user = this.usersRepository.create({
            ...registerDto,
            userType: user_entity_1.UserType.ORGADMIN,
            passwordHash,
            isEmailVerified: false,
            isFirstLogin: true
        });
        await this.usersRepository.save(user);
        const { passwordHash: _, ...result } = user;
        return {
            user: result,
            tempPassword
        };
    }
    async createUser(registerDto, creator) {
        if (creator.userType !== user_entity_1.UserType.SUPERADMIN && creator.organizationId !== registerDto.organizationId) {
            throw new common_1.ForbiddenException('You can only create users for your organization');
        }
        const existingUser = await this.usersRepository.findOne({
            where: { email: registerDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (creator.userType === user_entity_1.UserType.ORGADMIN &&
            ![user_entity_1.UserType.ADMIN, user_entity_1.UserType.COLLABORATOR, user_entity_1.UserType.EMPLOYEE].includes(registerDto.userType)) {
            throw new common_1.ForbiddenException('OrgAdmin can only create ADMIN, COLLABORATOR or EMPLOYEE users');
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
    async updateUser(userId, updateUserDto, creator) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (creator.userType !== user_entity_1.UserType.SUPERADMIN && creator.organizationId !== user.organizationId) {
            throw new common_1.ForbiddenException('You can only update users from your organization');
        }
        await this.usersRepository.update(userId, updateUserDto);
        const updatedUser = await this.usersRepository.findOne({
            where: { id: userId },
            select: user_select_fields_1.USER_SELECT_FIELDS
        });
        return updatedUser;
    }
    async deleteUser(userId, creator) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['organization']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (creator.userType !== user_entity_1.UserType.SUPERADMIN) {
            if (creator.organizationId !== user.organizationId) {
                throw new common_1.ForbiddenException('You can only delete users from your organization');
            }
            if (user.userType === user_entity_1.UserType.ORGADMIN) {
                throw new common_1.ForbiddenException('Only SUPERADMIN can delete organization admins');
            }
        }
        await this.refreshTokenRepository.delete({ userId });
        await this.verificationTokenRepository.delete({ userId });
        await this.usersRepository.remove(user);
    }
    async changePassword(userId, dto) {
        const user = await this.usersRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const passwordHash = await argon2.hash(dto.newPassword);
        await this.usersRepository.update(userId, {
            passwordHash,
            isFirstLogin: false
        });
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
    }
    async resetAdminPassword(userId, creator) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['organization']
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (creator.userType !== user_entity_1.UserType.SUPERADMIN) {
            if (creator.userType === user_entity_1.UserType.ORGADMIN && user.organizationId !== creator.organizationId) {
                throw new common_1.ForbiddenException('You can only reset passwords for users in your organization');
            }
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await argon2.hash(tempPassword);
        await this.usersRepository.update(userId, {
            passwordHash,
            isFirstLogin: true
        });
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true });
        return { tempPassword };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __param(2, (0, typeorm_1.InjectRepository)(verification_token_entity_1.VerificationToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        email_service_1.EmailService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map