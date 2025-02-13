import { User } from '../../users/entities/user.entity';
export declare class RefreshToken {
    id: string;
    userId: string;
    user: User;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    isRevoked: boolean;
}
