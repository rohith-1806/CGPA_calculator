import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, getAdminMe } from '../services/adminApi';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('growx_admin_jwt_token'));
  const [loadingAdmin, setLoadingAdmin] = useState(true);

  useEffect(() => {
    const initAdminAuth = async () => {
      const storedToken = localStorage.getItem('growx_admin_jwt_token');
      if (storedToken) {
        try {
          const data = await getAdminMe();
          if (data.success && data.user && data.user.role === 'admin') {
            setAdminUser(data.user);
          } else {
            logoutAdminAccount();
          }
        } catch (err) {
          console.error('Failed to verify admin session:', err);
          logoutAdminAccount();
        }
      }
      setLoadingAdmin(false);
    };

    initAdminAuth();
  }, []);

  const loginAdminAccount = async (email, password) => {
    const data = await loginAdmin(email, password);
    if (data.success && data.token) {
      localStorage.setItem('growx_admin_jwt_token', data.token);
      localStorage.setItem('growx_admin_user_data', JSON.stringify(data.user));
      setAdminToken(data.token);
      setAdminUser(data.user);
    }
    return data;
  };

  const logoutAdminAccount = () => {
    localStorage.removeItem('growx_admin_jwt_token');
    localStorage.removeItem('growx_admin_user_data');
    setAdminToken(null);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAdminAuthenticated: !!adminToken && !!adminUser && adminUser.role === 'admin',
        loadingAdmin,
        loginAdminAccount,
        logoutAdminAccount
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
