import { UserType } from '../types/user';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  CHANGE_PASSWORD: '/change-password',
  DASHBOARD: '/dashboard',
  DASHBOARD_APP: '/dashboard/app',
  ORGANIZATIONS: '/dashboard/organizations',
  MEMBERS: '/dashboard/members',
  PROFILE: '/dashboard/profile',
} as const;

export type AppRoute = keyof typeof ROUTES;

export const ROUTE_PERMISSIONS = {
  [ROUTES.ORGANIZATIONS]: [UserType.SUPERADMIN],
  [ROUTES.MEMBERS]: [UserType.SUPERADMIN],
  [ROUTES.DASHBOARD_APP]: [
    UserType.SUPERADMIN,
    UserType.ORGADMIN,
    UserType.ADMIN,
    UserType.COLLABORATOR,
    UserType.EMPLOYEE
  ],
  [ROUTES.PROFILE]: [
    UserType.SUPERADMIN,
    UserType.ORGADMIN,
    UserType.ADMIN,
    UserType.COLLABORATOR,
    UserType.EMPLOYEE
  ],
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
  ROUTES.CHANGE_PASSWORD,
] as const;

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.DASHBOARD_APP;
export const DEFAULT_GUEST_ROUTE = ROUTES.LOGIN;

// Helper pentru a extrage path-ul relativ pentru rutele dashboard
export const getRelativePath = (path: string) => path.replace(`${ROUTES.DASHBOARD}/`, ''); 