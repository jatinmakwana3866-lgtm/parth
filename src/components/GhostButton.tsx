import React from 'react';
import { ghostBtnStyle } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function GhostButton({ children, onClick, style }: Props) {
  return (
    <button style={{ ...ghostBtnStyle, ...style }} onClick={onClick}>
      {children}
    </button>
  );
}
