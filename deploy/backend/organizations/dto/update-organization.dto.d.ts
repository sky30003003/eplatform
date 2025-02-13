import { OrganizationStatus } from '../entities/organization.entity';
export declare class UpdateOrganizationDto {
    name?: string;
    email?: string;
    phone?: string;
    companyCode?: string;
    avatarUrl?: string;
    status?: OrganizationStatus;
}
