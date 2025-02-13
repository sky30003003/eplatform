import { User } from '../../users/entities/user.entity';
export declare enum TokenType {
    PASSWORD_RESET = "PASSWORD_RESET",
    EMAIL_VERIFICATION = "EMAIL_VERIFICATION"
}
export declare class VerificationToken {
    id: string;
    userId: string;
    user: User;
    token: string;
    type: TokenType;
    expiresAt: Date;
    createdAt: Date;
    isUsed: boolean;
}
