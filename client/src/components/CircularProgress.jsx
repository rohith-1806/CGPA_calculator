import React from 'react';

export const CircularProgress = ({
  value = 0,
  max = 10,
  size = 140,
  strokeWidth = 10,
  label = 'CGPA',
  sublabel = '',
  colorGradient = ['#6366F1', '#8B5CF6']
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `grad-${label.replace(/\s+/g, '-')}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorGradient[0]} />
            <stop offset="100%" stopColor={colorGradient[1]} />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border-color)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <span
          style={{
            fontSize: size > 120 ? '26px' : '20px',
            fontWeight: '800',
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-main)',
            lineHeight: 1
          }}
        >
          {value.toFixed(2)}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginTop: '4px'
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span style={{ fontSize: '10px', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '2px' }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};
