import { Organization } from '../../organizations/entities/organization.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { VerificationToken } from '../../auth/entities/verification-token.entity';
export declare enum UserType {
    SUPERADMIN = "SUPERADMIN",
    ORGADMIN = "ORGADMIN",
    ADMIN = "ADMIN",
    COLLABORATOR = "COLLABORATOR",
    EMPLOYEE = "EMPLOYEE"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}
export declare class User {
    id: string;
    organizationId: string;
    organization: Organization;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
    personalCode: string;
    userType: UserType;
    status: UserStatus;
    isEmailVerified: boolean;
    isFirstLogin?: boolean;
    createdAt: Date;
    updatedAt: Date;
    refreshTokens: RefreshToken[];
    verificationTokens: VerificationToken[];
}
