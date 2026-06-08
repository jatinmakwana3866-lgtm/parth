import React from 'react';
import { glassStyle, goldGlassStyle } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  gold?: boolean;
}

export function GlassCard({ children, style, onClick, gold }: Props) {
  return (
    <div
      style={{ ...(gold ? goldGlassStyle : glassStyle), ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
