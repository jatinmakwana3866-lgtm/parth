import type React from 'react';

export const C = {
  bg:'#0A0E1A', surface1:'#111827', surface2:'#1C2438',
  gold:'#D4A853', goldDark:'#7A5520', goldLight:'#F0C97A',
  jade:'#2ECC8A', rose:'#E8516A', amber:'#F0A030', sky:'#4BA8D4',
  text:'#F8F5F0', textSoft:'#A8A29E', textMuted:'#4B5563',
  glassBg:'rgba(255,255,255,0.06)', glassBorder:'rgba(255,255,255,0.10)',
  goldGlassBg:'rgba(212,168,83,0.09)', goldGlassBorder:'rgba(212,168,83,0.22)',
} as const;

export const glassStyle: React.CSSProperties = {
  background:C.glassBg, backdropFilter:'blur(20px) saturate(180%)',
  WebkitBackdropFilter:'blur(20px) saturate(180%)',
  border:`1px solid ${C.glassBorder}`, borderRadius:'20px',
};

export const goldGlassStyle: React.CSSProperties = {
  background:C.goldGlassBg, backdropFilter:'blur(20px) saturate(180%)',
  WebkitBackdropFilter:'blur(20px) saturate(180%)',
  border:`1px solid ${C.goldGlassBorder}`, borderRadius:'20px',
};

export const pageStyle: React.CSSProperties = {
  background:`radial-gradient(ellipse at 15% 0%, rgba(212,168,83,0.13) 0%, transparent 55%), radial-gradient(ellipse at 85% 0%, rgba(46,204,138,0.08) 0%, transparent 50%), #0A0E1A`,
  minHeight:'100vh',
  fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  color:C.text, maxWidth:'430px', margin:'0 auto', position:'relative' as const, overflowY:'auto' as const,
};

export const goldBtnStyle: React.CSSProperties = {
  background:'linear-gradient(135deg, #D4A853, #7A5520)', color:'#0A0E1A',
  border:'none', borderRadius:'14px', padding:'15px 0', width:'100%',
  fontWeight:700, fontSize:'16px', letterSpacing:'-0.01em',
  cursor:'pointer', transition:'all 0.15s ease', fontFamily:'inherit',
};

export const ghostBtnStyle: React.CSSProperties = {
  background:'transparent', border:'1.5px solid #D4A853', color:'#D4A853',
  borderRadius:'14px', padding:'15px 0', width:'100%',
  fontWeight:700, fontSize:'16px', cursor:'pointer',
  transition:'all 0.15s ease', fontFamily:'inherit',
};

export const inputStyle: React.CSSProperties = {
  width:'100%', background:'#1C2438', border:'1px solid rgba(255,255,255,0.10)',
  borderRadius:'14px', padding:'15px 16px', color:'#F8F5F0',
  fontSize:'15px', outline:'none', boxSizing:'border-box' as const,
  fontFamily:'inherit', transition:'border 0.2s ease',
};
