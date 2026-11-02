import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getProfile } from '../services/profileApi';
import { FiUser, FiLogOut, FiSun, FiMoon, FiShield, FiCalendar } from 'react-icons/fi';

export const Profile = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.success) {
          setProfileData(res.user);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'PR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>
          Student Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Your verified credentials and class registration details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel animate-fade-in" style={{ padding: '32px', marginBottom: '24px' }}>
        {/* Avatar & Main Name Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '800',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)',
              flexShrink: 0
            }}
          >
            {getInitials(profileData?.name)}
          </div>

          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
              {profileData?.name}
            </h2>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-emerald)',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              <FiShield size={12} /> Approved Student Account
            </span>
          </div>
        </div>

        {/* Clean Student Fields List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Student Name</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '15px' }}>{profileData?.name}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Roll Number</span>
            <strong style={{ color: 'var(--accent-primary)', fontSize: '15px', letterSpacing: '0.03em' }}>
              {profileData?.rollNumber}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Email / Login ID</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>{profileData?.email || profileData?.loginId}</strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Branch</span>
            <strong style={{ color: 'var(--accent-primary)', fontSize: '14px', fontWeight: '700' }}>
              {profileData?.branch || 'CSE'}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '12px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Present Year</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>
              {profileData?.presentYear || '4th Year'}
            </strong>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '4px'
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Present Semester</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '14px' }}>
              {profileData?.presentSemester || '1st Semester'}
            </strong>
          </div>
        </div>
      </div>

      {/* Appearance Settings Panel */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>
            Appearance Preference
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            {theme === 'dark' ? 'Royal Dark Theme' : 'Royal Light Theme'}
          </p>
        </div>

        <button onClick={toggleTheme} className="glass-btn-secondary" style={{ padding: '10px 18px' }}>
          {theme === 'dark' ? <FiSun size={18} color="#F59E0B" /> : <FiMoon size={18} color="#6366F1" />}
          <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      {/* Logout Action Card */}
      <button
        onClick={logout}
        style={{
          width: '100%',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.25)',
          color: 'var(--accent-rose)',
          padding: '14px',
          borderRadius: '14px',
          fontWeight: '700',
          fontSize: '15px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        <FiLogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};
