import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getMe } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('growx_jwt_token'));
  const [loading, setLoading] = useState(true);

  // Verify stored JWT token on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('growx_jwt_token');
      if (storedToken) {
        try {
          const data = await getMe();
          if (data.success) {
            setUser(data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to restore session:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (loginId, password) => {
    const data = await loginUser(loginId, password);
    if (data.success && data.token) {
      localStorage.setItem('growx_jwt_token', data.token);
      localStorage.setItem('growx_user_data', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('growx_jwt_token');
    localStorage.removeItem('growx_user_data');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
