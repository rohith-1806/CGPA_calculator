import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Calculator } from './pages/Calculator';
import { Performance } from './pages/Performance';
import { Profile } from './pages/Profile';

import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-main)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-main)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Initializing GrowX Private Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Student Routes */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Calculator />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Performance />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Dedicated Admin Routes */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/students/create"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id/edit"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/records"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
