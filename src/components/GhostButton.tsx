import React from 'react';
import { CDark, fonts } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Per PRD 3.3: secondary actions are plain text links, not buttons
export function GhostButton({ children, onClick, style }: Props) {
  return (
    <button
      style={{
        background: 'transparent',
        border: 'none',
        color: CDark.muted,
        cursor: 'pointer',
        fontFamily: fonts.body,
        fontSize: '15px',
        fontWeight: 500,
        padding: '12px 0',
        width: '100%',
        textAlign: 'center',
        transition: 'color 0.15s ease',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
