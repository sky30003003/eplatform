import { Organization } from './organization';

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
  organization?: Organization;
  isEmailVerified: boolean;
  isFirstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StatusInfo = {
  color: 'success' | 'warning' | 'error';
  tooltip: string[];
};

export const getUserStatusInfo = (user: User): StatusInfo => {
  // Cazul 1: User inactiv sau blocat
  if (user.status === UserStatus.INACTIVE || user.status === UserStatus.BLOCKED) {
    return {
      color: 'error',
      tooltip: [
        `Cont ${user.status.toLowerCase()}`,
        'Utilizatorul nu poate accesa platforma până la activarea contului'
      ]
    };
  }

  // Cazul 2: User activ dar cu probleme de verificare
  if (!user.isEmailVerified || user.isFirstLogin) {
    const issues = [];
    if (!user.isEmailVerified) {
      issues.push('Email-ul nu este verificat');
    }
    if (user.isFirstLogin) {
      issues.push('Parola inițială nu a fost schimbată');
    }
    
    return {
      color: 'warning',
      tooltip: [
        'Cont activ cu configurare incompletă:',
        ...issues,
        'Funcționalitatea este limitată până la finalizarea configurării'
      ]
    };
  }

  // Cazul 3: Totul este ok
  return {
    color: 'success',
    tooltip: [
      'Cont complet configurat și activ',
      'Email verificat',
      'Parolă personalizată setată'
    ]
  };
}; 