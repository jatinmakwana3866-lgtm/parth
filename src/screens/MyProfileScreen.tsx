import React from 'react';
import { Edit2, BadgeCheck, MapPin, ChevronRight, LogOut, Wallet, Gift, Bell, Globe, Shield, HelpCircle, MessageCircle, Eye } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle } from '../lib/tokens';
import { BottomNav } from '../components/BottomNav';
import { RoleBadge } from '../components/RoleBadge';
import { ROLES } from '../data/roles';
import type { ScreenName } from '../types';

const MENU_ITEMS: { icon: React.ReactNode; label: string; screen: ScreenName }[] = [
  { icon: <Wallet size={18} />, label: 'Token Wallet', screen: 'tokenWallet' },
  { icon: <Gift size={18} />, label: 'Refer & Earn', screen: 'referEarn' },
  { icon: <Bell size={18} />, label: 'Notifications', screen: 'home' },
  { icon: <Globe size={18} />, label: 'Language', screen: 'language' },
  { icon: <Shield size={18} />, label: 'Privacy', screen: 'home' },
  { icon: <HelpCircle size={18} />, label: 'Help & Support', screen: 'home' },
];

export function MyProfileScreen() {
  const user = useStore(s => s.user);
  const userList = useStore(s => s.userList);
  const setScreen = useStore(s => s.setScreen);
  const handleSignOut = useStore(s => s.handleSignOut);
  const role = ROLES.find(r => r.id === user.role);
  const unlockedCount = userList.filter(u => u.unlocked).length;

  return (
    <div style={{ ...pageStyle, paddingBottom: '80px' }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${role?.color || C.gold}22 0%, transparent 100%)`,
        padding: '56px 24px 28px',
        position: 'relative',
      }}>
        <button style={{
          position: 'absolute', top: '56px', right: '24px',
          background: 'rgba(255,255,255,0.08)', border: 'none',
          borderRadius: '10px', padding: '8px', cursor: 'pointer',
        }}>
          <Edit2 size={16} color={C.textSoft} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: user.photoURL ? 'transparent' : `${role?.color || C.gold}22`,
            border: `2px solid ${role?.color || C.gold}66`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '38px', margin: '0 auto 14px',
          }}>
            {user.photoURL
              ? <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (role?.icon || '👤')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: C.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.name || 'Your Name'}
            </h1>
            {user.verified && <BadgeCheck size={18} color={C.sky} />}
          </div>

          <RoleBadge roleId={user.role} style={{ marginBottom: '8px' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <MapPin size={13} color={C.textSoft} />
            <span style={{ fontSize: '13px', color: C.textSoft }}>{user.city}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: 'Tokens', value: user.tokens, icon: '🪙' },
          { label: 'Unlocked', value: unlockedCount, icon: <MessageCircle size={16} color={C.jade} /> },
          { label: 'Profile Views', value: '128', icon: <Eye size={16} color={C.sky} /> },
        ].map((s, i) => (
          <div key={i} style={{ ...glassStyle, padding: '14px', textAlign: 'center' }}>
            <div style={{ marginBottom: '4px' }}>{typeof s.icon === 'string' ? <span>{s.icon}</span> : s.icon}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: C.text }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: C.textSoft }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => setScreen(item.screen)}
            style={{
              ...glassStyle,
              padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: '14px',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%',
              background: C.glassBg,
            }}
          >
            <div style={{ color: C.textSoft }}>{item.icon}</div>
            <span style={{ flex: 1, fontSize: '15px', color: C.text, textAlign: 'left' }}>{item.label}</span>
            <ChevronRight size={16} color={C.textMuted} />
          </button>
        ))}
      </div>

      {/* Sign Out */}
      <div style={{ padding: '0 24px' }}>
        <button
          onClick={handleSignOut}
          style={{
            background: 'transparent', border: `1.5px solid ${C.rose}`,
            color: C.rose, borderRadius: '14px', padding: '14px 0', width: '100%',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: 'inherit',
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
