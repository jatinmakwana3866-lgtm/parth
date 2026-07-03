import React from 'react';
import { glassStyle, glassStrongStyle, radii, CDark } from '../lib/tokens';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  variant?: 'default' | 'strong' | 'gold';
}

export function GlassCard({ children, style, onClick, variant = 'default' }: Props) {
  const getStyle = (): React.CSSProperties => {
    if (variant === 'gold') {
      return {
        background: `rgba(184,146,78,0.12)`,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: `1px solid rgba(184,146,78,0.25)`,
        borderRadius: radii.md,
      };
    }
    if (variant === 'strong') {
      return glassStrongStyle;
    }
    return glassStyle;
  };

  return (
    <div
      style={{ ...getStyle(), ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
