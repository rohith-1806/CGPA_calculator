import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiUser } from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';

export const Sidebar = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: FiHome },
    { label: 'CGPA Calculator', path: '/calculator', icon: FaCalculator },
    { label: 'Academic Performance', path: '/performance', icon: FiTrendingUp },
    { label: 'Profile', path: '/profile', icon: FiUser }
  ];

  return (
    <aside
      style={{
        width: '240px',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flexShrink: 0
      }}
      className="desktop-sidebar"
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          padding: '0 12px 12px 12px'
        }}
      >
        GrowX Navigation
      </span>

      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-gradient)' : 'transparent',
              boxShadow: isActive ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            })}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <style>{`
        @media (max-width: 767px) {
          .desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};
