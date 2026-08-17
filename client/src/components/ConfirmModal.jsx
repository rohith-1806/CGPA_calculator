import React from 'react';
import { FiAlertTriangle, FiX, FiTrash2 } from 'react-icons/fi';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          borderRadius: '20px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: isDanger ? 'rgba(244, 63, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: isDanger ? 'var(--accent-rose)' : 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FiAlertTriangle size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '8px'
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: isDanger ? 'linear-gradient(135deg, #F43F5E, #E11D48)' : 'var(--accent-gradient)',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isDanger ? '0 4px 14px rgba(244, 63, 94, 0.35)' : '0 4px 14px rgba(99, 102, 241, 0.35)'
            }}
          >
            {isDanger && <FiTrash2 size={16} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
