import React from 'react';
import { goldBtnStyle } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function PrimaryButton({ children, onClick, disabled, style }: Props) {
  const disabledStyle: React.CSSProperties = {
    background: '#1C2438',
    color: '#4B5563',
    cursor: 'not-allowed',
  };

  return (
    <button
      style={{ ...goldBtnStyle, ...(disabled ? disabledStyle : {}), ...style }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
