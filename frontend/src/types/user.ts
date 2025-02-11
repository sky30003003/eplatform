export enum UserType {
  SUPERADMIN = 'SUPERADMIN',
  ORGADMIN = 'ORGADMIN',
  ADMIN = 'ADMIN',
  COLLABORATOR = 'COLLABORATOR',
  EMPLOYEE = 'EMPLOYEE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  personalCode: string;
  userType: UserType;
  status: UserStatus;
  organizationId?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
} 