import type React from 'react';

// Luxury Boutique Design System - Light Mode
export const CLight = {
  background: '#FFFFFF',
  foreground: '#0D0D0D',
  primary: '#B8924E',         // Gold accent
  primaryGlow: '#E0C98A',     // Gold gradient highlight
  accent: '#141414',          // Button surface (black)
  secondary: '#F5F5F5',      // Chips, soft surfaces
  muted: '#6B6B6B',          // Secondary text
  border: '#E3E3E3',
  card: '#FFFFFF',
  success: '#30A557',
  whatsapp: '#25D366',
} as const;

// Luxury Boutique Design System - Dark Mode
export const CDark = {
  background: '#000000',
  foreground: '#F5F5F5',
  primary: '#D4B673',         // Soft gold
  primaryGlow: '#E6CC92',
  accent: '#FFFFFF',          // Button surface (white)
  secondary: '#1A1A1A',
  muted: '#8A8A8A',
  border: '#242424',
  card: '#121212',
  success: '#30A557',
  whatsapp: '#25D366',
} as const;

// Active color set (defaults to dark for legacy compatibility)
export const C = CDark;

// Legacy aliases for backward compatibility
export const goldBtnStyle = buttonStyle(true);
export const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1.5px solid #D4B673',
  color: '#D4B673',
  borderRadius: '14px',
  padding: '15px 0',
  width: '100%',
  fontWeight: 700,
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: fonts.body,
};

// Typography
export const fonts = {
  display: '"Manrope", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

// Type scale
export const typeScale = {
  hero: { size: '32px', weight: 800, font: fonts.display },
  h1: { size: '26px', weight: 700, font: fonts.display },
  h2: { size: '20px', weight: 700, font: fonts.display },
  h3: { size: '17px', weight: 600, font: fonts.display },
  body: { size: '16px', weight: 400, font: fonts.body },
  label: { size: '14px', weight: 500, font: fonts.body },
  caption: { size: '12px', weight: 400, font: fonts.body },
} as const;

// Squircle radii
export const radii = {
  sm: '12px',    // Inputs, chips
  md: '20px',    // Cards, buttons
  lg: '24px',    // Modals, sheets
  pill: '100px', // Tags, badges
} as const;

// The One Button Style (per PRD 3.3)
export const buttonStyle = (isDark: boolean = true): React.CSSProperties => {
  const colors = isDark ? CDark : CLight;
  return {
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    minHeight: '52px',
    paddingHorizontal: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    border: 'none',
    cursor: 'pointer',
    fontFamily: fonts.body,
    fontSize: '16px',
    fontWeight: 600,
    color: isDark ? '#0D0D0D' : '#FFFFFF',
    boxShadow: `0 6px 16px ${colors.primary}61`, // 38% opacity gold glow
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  };
};

// WhatsApp button exception (same shape, different color)
export const whatsappButtonStyle = (isDark: boolean = true): React.CSSProperties => ({
  ...buttonStyle(isDark),
  backgroundColor: '#25D366',
  boxShadow: 'none',
});

// Glass surfaces
export const glassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: `1px solid rgba(255,255,255,0.12)`,
  borderRadius: radii.md,
};

export const glassStrongStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border: `1px solid rgba(255,255,255,0.18)`,
  borderRadius: radii.lg,
};

export const goldGlassStyle: React.CSSProperties = {
  background: 'rgba(184,146,78,0.12)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: `1px solid rgba(184,146,78,0.35)`,
  borderRadius: radii.md,
};

export const liquidGlassStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.05) 100%)',
  backdropFilter: 'blur(28px) saturate(180%)',
  WebkitBackdropFilter: 'blur(28px) saturate(180%)',
  border: `1px solid rgba(255,255,255,0.15)`,
  borderRadius: radii.lg,
};

// Page style with mesh gradient background
export const pageStyle: React.CSSProperties = {
  background: `radial-gradient(ellipse at 15% 0%, rgba(184,146,78,0.15) 0%, transparent 55%), #000000`,
  minHeight: '100vh',
  fontFamily: fonts.body,
  color: CDark.foreground,
  maxWidth: '430px',
  margin: '0 auto',
  position: 'relative',
  overflowY: 'auto',
};

// Card style
export const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, #FBF8F4 100%)',
  borderRadius: radii.md,
  border: `1px solid ${CDark.border}`,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

// Input field style
export const inputStyle: React.CSSProperties = {
  width: '100%',
  background: CDark.secondary,
  border: `1px solid ${CDark.border}`,
  borderRadius: radii.sm,
  padding: '14px 16px',
  color: CDark.foreground,
  fontSize: '16px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: fonts.body,
  transition: 'border 0.2s ease, box-shadow 0.2s ease',
};

// Easing curves
export const easing = {
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;
