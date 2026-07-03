import React, { useState } from 'react';
import { buttonStyle, easing } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
  loading?: boolean;
}

export function PrimaryButton({ children, onClick, disabled, style, loading }: Props) {
  const [pressed, setPressed] = useState(false);

  const baseStyle: React.CSSProperties = buttonStyle(true);

  const stateStyles: React.CSSProperties = {
    ...baseStyle,
    ...(disabled || loading
      ? { opacity: 0.4, boxShadow: 'none', cursor: 'not-allowed' }
      : {}),
    ...(pressed && !disabled && !loading
      ? { transform: 'scale(0.97)' }
      : {}),
    transition: `transform 0.15s ${easing.spring}, opacity 0.15s ease, box-shadow 0.15s ease`,
  };

  return (
    <button
      style={{ ...stateStyles, ...style }}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {loading ? (
        <span style={{
          width: '20px',
          height: '20px',
          border: '2px solid transparent',
          borderTopColor: 'currentColor',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      ) : children}
    </button>
  );
}
