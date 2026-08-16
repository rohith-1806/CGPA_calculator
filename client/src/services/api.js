import axios from 'axios';

const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    let cleanUrl = envUrl.trim().replace(/\/+$/, '');
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = `${cleanUrl}/api`;
    }
    return cleanUrl;
  }

  // Default fallback for local development with Vite proxy
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('growx_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 Unauthorized and handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid and not already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('growx_jwt_token');
        localStorage.removeItem('growx_user_data');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
