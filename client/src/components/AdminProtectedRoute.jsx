import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminProtectedRoute = ({ children }) => {
  const { isAdminAuthenticated, loadingAdmin } = useAdminAuth();

  if (loadingAdmin) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'var(--bg-main)'
        }}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-main)' }}>
          <div
            className="pulse-spinner"
            style={{
              width: '48px',
              height: '48px',
              border: '4px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}
          />
          <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Verifying Admin Credentials...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};
