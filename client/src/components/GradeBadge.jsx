import React from 'react';
import { getGradeConfig } from '../utils/gradeUtils';

export const GradeBadge = ({ grade = 'A' }) => {
  const config = getGradeConfig(grade);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 10px',
        borderRadius: '8px',
        fontWeight: '700',
        fontSize: '12px',
        letterSpacing: '0.02em',
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        boxShadow: `0 2px 8px ${config.bg}`
      }}
    >
      Grade {grade}
    </span>
  );
};
