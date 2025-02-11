import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import jwtDecode from 'jwt-decode';
import { isAxiosError } from 'axios';
import { axiosInstance } from '../utils/axios';
import { User } from '../types/user';
import { API_ENDPOINTS } from '../config/api.config';
import { ROUTES } from '../config/routes.config';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  lastLocation: string | null;
  isFirstLogin: boolean;
}

interface JwtPayload {
  sub: string;
  email: string;
  userType: string;
  organizationId?: string;
  exp: number;
}

interface AuthAction {
  type: 'INITIALIZE' | 'LOGIN' | 'LOGOUT';
  payload?: {
    isAuthenticated?: boolean;
    user?: User | null;
    lastLocation?: string | null;
    isFirstLogin?: boolean;
  };
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  lastLocation: null,
  isFirstLogin: false,
};

const handlers = {
  INITIALIZE: (state: AuthState, action: AuthAction): AuthState => {
    const { isAuthenticated, user, lastLocation, isFirstLogin } = action.payload || {};
    return {
      ...state,
      isAuthenticated: isAuthenticated || false,
      isInitialized: true,
      user: user || null,
      lastLocation: lastLocation || null,
      isFirstLogin: isFirstLogin || false,
    };
  },
  LOGIN: (state: AuthState, action: AuthAction): AuthState => {
    const { user, isFirstLogin } = action.payload || {};
    return {
      ...state,
      isAuthenticated: true,
      user: user || null,
      isFirstLogin: isFirstLogin || false,
    };
  },
  LOGOUT: (state: AuthState): AuthState => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state: AuthState, action: AuthAction) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const userDetails = await fetchUserDetails();
        
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: true,
            user: userDetails,
            lastLocation: location.pathname,
            isFirstLogin: userDetails.isFirstLogin,
          },
        });
      } else {
        setSession(null);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            lastLocation: location.pathname,
            isFirstLogin: false,
          },
        });
      }
    } catch (err) {
      setSession(null);
      dispatch({
        type: 'INITIALIZE',
        payload: {
          isAuthenticated: false,
          user: null,
          lastLocation: location.pathname,
          isFirstLogin: false,
        },
      });
    }
  }, [location.pathname, fetchUserDetails]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      const { access_token, refresh_token, user } = response.data;
      setSession(access_token);
      localStorage.setItem('refreshToken', refresh_token);

      dispatch({
        type: 'LOGIN',
        payload: {
          isAuthenticated: true,
          user,
          isFirstLogin: user.isFirstLogin,
        },
      });

      if (user.isFirstLogin) {
        navigate('/change-password');
      }
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          throw new Error('Email sau parolă incorecte');
        } else if (err.response?.status === 403) {
          throw new Error('Contul este blocat. Contactați administratorul');
        } else if (err.response?.data?.message) {
          throw new Error(err.response.data.message);
        }
      }
      throw new Error('A apărut o eroare la autentificare');
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setSession(null);
      localStorage.removeItem('refreshToken');
      dispatch({ type: 'LOGOUT' });
      navigate('/login');
    }
  }, [navigate]);

  const register = useCallback(async (data: any) => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await axiosInstance.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      requestPasswordReset,
      resetPassword,
      verifyEmail,
    }),
    [state, login, register, logout, requestPasswordReset, resetPassword, verifyEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Helper functions
const isValidToken = (accessToken: string) => {
  if (!accessToken) {
    return false;
  }
  try {
    const decoded = jwtDecode<JwtPayload>(accessToken);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

const setSession = (accessToken: string | null) => {
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}; 