import { User } from '../../users/entities/user.entity';
export declare enum OrganizationStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare class Organization {
    id: string;
    name: string;
    email: string;
    phone: string;
    companyCode: string;
    avatarUrl: string;
    status: OrganizationStatus;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
