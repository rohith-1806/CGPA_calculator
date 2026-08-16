import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiAward, FiLock, FiMail, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginId.trim() || !password) {
      setErrorMessage('Invalid login credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(loginId.trim(), password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage(res.message || 'Invalid login credentials.');
      }
    } catch (err) {
      setErrorMessage('Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px'
      }}
    >
      {/* Background Animated Glow */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(50px)',
          animation: 'pulseGlow 6s ease-in-out infinite alternate',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.2) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          animation: 'pulseGlow 8s ease-in-out infinite alternate-reverse',
          pointerEvents: 'none'
        }}
      />

      {/* Glassmorphic Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--card-bg)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          zIndex: 10,
          position: 'relative',
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)'
            }}
          >
            <FiAward size={32} color="#FFFFFF" />
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              marginBottom: '6px'
            }}
            className="gradient-text"
          >
            GrowX
          </h1>
          <p style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: '700' }}>
            Welcome to GrowX
          </p>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Your academic & career companion.
          </span>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#F43F5E',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Login ID Input with strictly example@gmail.com placeholder */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}
            >
              Login ID
            </label>
            <div style={{ position: 'relative' }}>
              <FiMail
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type="text"
                placeholder="example@gmail.com"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 44px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
          </div>

          {/* Password Input with strictly Enter your password placeholder */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '8px'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FiLock
                size={18}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 44px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="gradient-btn"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '28px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            🔒 Private Academic Portal • Class Authorization Only
          </p>
        </div>
      </div>
    </div>
  );
};
