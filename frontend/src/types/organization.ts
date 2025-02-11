export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  companyCode: string;
  avatarUrl?: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  email: string;
  phone: string;
  companyCode: string;
  avatarUrl?: string;
}

export interface UpdateOrganizationDto extends Partial<CreateOrganizationDto> {
  status?: OrganizationStatus;
} 