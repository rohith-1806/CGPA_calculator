import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUser } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';

export const BottomNav = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: FiHome },
    { label: 'Calculator', path: '/calculator', icon: FaCalculator },
    { label: 'Performance', path: '/performance', icon: FiTrendingUp },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65px',
        background: 'var(--bottom-nav-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        padding: '0 8px'
      }}
      className="mobile-bottom-nav"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              flex: 1,
              height: '100%',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: isActive ? '700' : '500',
              fontSize: '11px',
              transition: 'all 0.2s ease'
            })}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <style>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};
