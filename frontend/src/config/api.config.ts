export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CREATE_ORGADMIN: '/auth/create-orgadmin',
    CREATE_USER: '/auth/create-user',
    UPDATE_USER: (id: string) => `/auth/update-user/${id}`,
    DELETE_USER: (id: string) => `/auth/delete-user/${id}`,
    CHANGE_PASSWORD: '/auth/change-password'
  },
  ORGANIZATIONS: {
    BASE: '/organizations',
    GET_BY_ID: (id: string) => `/organizations/${id}`,
    GET_ADMIN: (id: string) => `/organizations/${id}/admin`,
    UPDATE: (id: string) => `/organizations/${id}`,
    DELETE: (id: string) => `/organizations/${id}`
  },
  USERS: {
    BASE: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`
  }
} as const; 