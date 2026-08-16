import React from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export const Toast = ({ message, type = 'success', isVisible }) => {
  if (!isVisible) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '85px',
        right: '24px',
        zIndex: 90,
        background: isSuccess ? 'rgba(16, 185, 129, 0.9)' : 'rgba(244, 63, 94, 0.9)',
        color: '#FFFFFF',
        padding: '10px 18px',
        borderRadius: '30px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        fontSize: '13px',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      {isSuccess ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
      <span>{message}</span>
    </div>
  );
};
