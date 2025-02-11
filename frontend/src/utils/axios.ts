import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { API_ENDPOINTS } from '../config/api.config';

interface JwtPayload {
  exp: number;
  sub: string;
  iat: number;
}

// Funcție pentru validarea token-ului
const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return (
      decoded.exp * 1000 > Date.now() && // verifică expirarea
      decoded.iat * 1000 <= Date.now() && // verifică data emiterii
      typeof decoded.sub === 'string' && // verifică prezența și tipul subject-ului
      decoded.sub.length > 0
    );
  } catch {
    return false;
  }
}

// Funcție pentru curățarea token-urilor și redirect
const clearAuthAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Curățăm și alte date sensibile din localStorage
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.href = '/login';
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true, // Important pentru CSRF protection
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      try {
        // Validăm token-ul înainte de a-l folosi
        if (!isTokenValid(accessToken)) {
          throw new Error('Invalid token');
        }

        const decoded = jwtDecode<JwtPayload>(accessToken);
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = decoded.exp - currentTime;
        
        if (timeUntilExpiry < 300 && !isRefreshing && config.url !== API_ENDPOINTS.AUTH.REFRESH) {
          isRefreshing = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken || !isTokenValid(refreshToken)) {
              throw new Error('Invalid refresh token');
            }

            const response = await axios.post(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
              refreshToken
            });
            
            const { access_token, refresh_token } = response.data;
            
            // Validăm noile token-uri înainte de a le salva
            if (!isTokenValid(access_token) || !isTokenValid(refresh_token)) {
              throw new Error('Invalid tokens received from server');
            }

            localStorage.setItem('accessToken', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            
            config.headers.Authorization = `Bearer ${access_token}`;
            processQueue();
          } catch (error) {
            processQueue(error);
            clearAuthAndRedirect();
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        } else if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error('Token validation error:', error);
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${import.meta.env.VITE_API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken
        });
        
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
        
        processQueue();
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export { axiosInstance }; 