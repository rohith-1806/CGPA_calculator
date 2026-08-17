import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiShield, FiLock, FiMail, FiArrowRight, FiSun, FiMoon, FiCheckCircle } from 'react-icons/fi';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdminAccount, isAdminAuthenticated } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated, redirect to /admin/dashboard
  React.useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both Admin Email and Password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdminAccount(email.trim(), password);
      if (res.success) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg-main)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Blur Orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '-150px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-150px',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(0, 0, 0, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Controls */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          gap: '12px'
        }}
      >
        <button
          onClick={toggleTheme}
          className="glass-btn-secondary"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {theme === 'dark' ? <FiSun size={16} color="#F59E0B" /> : <FiMoon size={16} color="#6366F1" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Card Wrapper */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 36px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#FFFFFF',
              boxShadow: '0 12px 24px rgba(79, 70, 229, 0.4)'
            }}
          >
            <FiShield size={32} />
          </div>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '6px',
              color: 'var(--text-main)'
            }}
          >
            GrowX Admin Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            Academic Management & Governance
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--accent-rose)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <FiLock size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}
            >
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              >
                <FiMail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mail.com"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              >
                <FiLock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Admin Dashboard</span>
                <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <FiCheckCircle size={14} color="var(--accent-emerald)" />
          <span>Protected by Encrypted Backend Validation</span>
        </div>
      </div>
    </div>
  );
};
