import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiLogOut, FiAward, FiUser } from 'react-icons/fi';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getInitials = (name) => {
    if (!name) return 'PR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header
      style={{
        height: '70px',
        background: 'var(--navbar-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Brand Logo & Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}
        >
          <FiAward size={24} color="#FFFFFF" />
        </div>
        <div>
          <span
            style={{
              fontSize: '22px',
              fontWeight: '800',
              letterSpacing: '-0.03em',
              fontFamily: "'Outfit', sans-serif"
            }}
            className="gradient-text"
          >
            GrowX
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: '500',
              marginTop: '-2px'
            }}
          >
            Academic Platform
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'dark' ? <FiSun size={18} color="#F59E0B" /> : <FiMoon size={18} color="#6366F1" />}
        </button>

        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px 6px 8px',
              borderRadius: '30px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--accent-gradient)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px'
              }}
            >
              {getInitials(user.name)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {user.rollNumber || user.loginId}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            color: 'var(--accent-rose)',
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FiLogOut size={16} />
          <span className="desktop-only">Logout</span>
        </button>
      </div>
    </header>
  );
};
