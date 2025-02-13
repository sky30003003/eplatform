import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserType } from '../users/entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
            status: import("../users/entities/user.entity").UserStatus;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            refreshTokens: import("./entities/refresh-token.entity").RefreshToken[];
            verificationTokens: import("./entities/verification-token.entity").VerificationToken[];
        };
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: any): Promise<void>;
    requestPasswordReset(dto: RequestPasswordResetDto): Promise<void>;
    resetPassword(dto: ResetPasswordDto): Promise<void>;
    verifyEmail(token: string): Promise<void>;
    getCurrentUser(req: any): Promise<import("./auth.service").UserResponse>;
    createOrgAdmin(registerDto: RegisterDto): Promise<{
        user: import("./auth.service").UserResponse;
        tempPassword: string;
    }>;
    createUser(registerDto: RegisterDto, req: any): Promise<import("./auth.service").UserResponse>;
    updateUser(id: string, updateUserDto: any, req: any): Promise<any>;
    deleteUser(id: string, req: any): Promise<void>;
    changePassword(req: any, dto: ChangePasswordDto): Promise<void>;
    resetAdminPassword(id: string, req: any): Promise<{
        tempPassword: string;
    }>;
}
