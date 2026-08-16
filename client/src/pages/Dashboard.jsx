import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAcademicRecord } from '../services/academicApi';
import {
  FiFileText,
  FiArrowRight,
  FiTool,
  FiStar,
  FiBookOpen,
  FiAward,
  FiCheckCircle,
  FiAlertTriangle,
  FiUser,
  FiLayers,
  FiTrendingUp
} from 'react-icons/fi';
import { FaCalculator } from 'react-icons/fa';
import { Modal } from '../components/Modal';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const [summary, setSummary] = useState(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        const res = await getAcademicRecord();
        if (res.success) {
          setSummary(res.summary);
        }
      } catch (err) {
        console.error('Failed to load dashboard academic summary:', err);
      } finally {
        setLoadingRecord(false);
      }
    };
    fetchAcademicData();
  }, []);

  const getDisplayName = (fullName) => {
    if (!fullName) return 'Student';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
    }
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  };

  const displayName = getDisplayName(user?.name);

  const totalSubjects = summary?.totalSubjects || 0;
  const passed = summary?.passed || 0;
  const backlogs = summary?.backlogs || 0;
  const totalCredits = summary?.totalCredits || 0;
  const totalSemesters = summary?.totalSemesters || 0;
  const cgpa = summary?.cgpa || 0;
  const percentage = summary?.percentage || 0;
  const classAwarded = summary?.classAwarded || 'Not Available';

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Welcome Banner */}
      <div
        className="glass-panel animate-fade-in"
        style={{
          padding: '36px 32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid var(--border-highlight)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--accent-primary)',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px'
            }}
          >
            <FiStar size={14} />
            Academic & Career Companion
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '8px',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome back, {user?.name || displayName} 👋
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Grow your academics. Grow your career.
          </p>
        </div>
      </div>

      {/* Main Two Action Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}
      >
        {/* CARD 1: CGPA CALCULATOR */}
        <div
          className="glass-card-interactive animate-fade-in"
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative'
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: 'var(--accent-primary)'
              }}
            >
              <FaCalculator size={26} />
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
              CGPA Calculator
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Manage your semesters, subjects, grades and credits and calculate your academic performance.
            </p>
          </div>

          <button
            onClick={() => navigate('/calculator')}
            className="gradient-btn"
            style={{ width: '100%', padding: '14px', fontSize: '15px' }}
          >
            <span>Open CGPA Calculator</span>
            <FiArrowRight size={18} />
          </button>
        </div>

        {/* CARD 2: ATS RESUME BUILDER */}
        <div
          className="glass-card-interactive animate-fade-in"
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            opacity: 0.9,
            animationDelay: '0.1s'
          }}
          onClick={() => setShowMaintenanceModal(true)}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-amber)'
                }}
              >
                <FiFileText size={28} />
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-amber)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.05em'
                }}
              >
                <FiTool size={12} />
                UNDER MAINTENANCE
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px' }}>
              Build Your ATS-Friendly Resume
            </h2>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
              Create a professional, recruiter-friendly resume optimized for ATS systems.
            </p>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '24px'
              }}
            >
              ✨ Resume Builder – Under Maintenance
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMaintenanceModal(true);
            }}
            className="glass-btn-secondary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              cursor: 'pointer',
              background: 'rgba(245, 158, 11, 0.1)',
              borderColor: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--accent-amber)'
            }}
          >
            <span>Coming Soon</span>
            <FiTool size={16} />
          </button>
        </div>
      </div>

      {/* Student Profile Card (Requirement 35) */}
      <div className="glass-panel animate-fade-in" style={{ padding: '24px 28px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FiUser size={20} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Student Profile</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Student Name
            </span>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.name}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Roll Number
            </span>
            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--accent-primary)', marginTop: '4px' }}>
              {user?.rollNumber}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Email / Login ID
            </span>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.loginId}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Present Semester
            </span>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)', marginTop: '4px' }}>
              {user?.presentSemester || '4th Year – 1st Semester'}
            </div>
          </div>
        </div>
      </div>

      {/* OVERALL OVERVIEW CARD (Requirement 23, 24, 25, 26, 35) */}
      <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiLayers size={22} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Overall Overview</h3>
          </div>

          {totalSemesters > 0 && (
            <button
              onClick={() => navigate('/performance')}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                color: 'var(--accent-primary)',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>View Performance Page</span>
              <FiArrowRight size={14} />
            </button>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px'
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Total Subjects
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {totalSubjects}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Passed
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-emerald)', marginTop: '4px' }}>
              {passed}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Backlogs
            </span>
            <div
              style={{
                fontSize: '24px',
                fontWeight: '800',
                color: backlogs === 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                marginTop: '4px'
              }}
            >
              {backlogs}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Total Credits
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {totalCredits}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Total Semesters
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
              {totalSemesters}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Current CGPA
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '4px' }}>
              {cgpa > 0 ? cgpa.toFixed(2) : '--'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Percentage
            </span>
            <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {percentage > 0 ? `${percentage.toFixed(2)}%` : '--'}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', gridColumn: 'span 1' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
              Class Awarded
            </span>
            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
              {classAwarded}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Resume Builder - Under Maintenance"
      >
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-amber)'
            }}
          >
            <FiTool size={32} />
          </div>
          <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
            Resume Builder – Under Maintenance
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.5' }}>
            This feature is currently undergoing scheduled maintenance. We'll be back soon!
          </p>
          <button
            onClick={() => setShowMaintenanceModal(false)}
            className="gradient-btn"
            style={{ width: '100%' }}
          >
            Got It
          </button>
        </div>
      </Modal>
    </div>
  );
};
