import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from '../utils/axios';
import { User } from '../types/user';
import { API_ENDPOINTS } from '../config/api.config';

interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: User | null;
  lastLocation: string | null;
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
};

const handlers = {
  INITIALIZE: (state: AuthState, action: AuthAction): AuthState => {
    const { isAuthenticated, user, lastLocation } = action.payload || {};
    return {
      ...state,
      isAuthenticated: isAuthenticated || false,
      isInitialized: true,
      user: user || null,
      lastLocation: lastLocation || null,
    };
  },
  LOGIN: (state: AuthState, action: AuthAction): AuthState => {
    const { user } = action.payload || {};
    return {
      ...state,
      isAuthenticated: true,
      user: user || null,
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
      const response = await axios.get(API_ENDPOINTS.AUTH.ME);
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
        },
      });
    }
  }, [location.pathname, fetchUserDetails]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });
      const { access_token, refresh_token } = response.data;
      
      setSession(access_token);
      localStorage.setItem('refreshToken', refresh_token);
      
      const userDetails = await fetchUserDetails();
      
      dispatch({
        type: 'LOGIN',
        payload: {
          user: userDetails,
        },
      });
    } catch (error) {
      setSession(null);
      throw error;
    }
  }, [fetchUserDetails]);

  const logout = useCallback(async () => {
    try {
      await axios.post(API_ENDPOINTS.AUTH.LOGOUT);
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
    await axios.post(API_ENDPOINTS.AUTH.REGISTER, data);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await axios.post(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    await axios.get(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/${token}`);
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
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    localStorage.removeItem('accessToken');
    delete axios.defaults.headers.common.Authorization;
  }
}; 