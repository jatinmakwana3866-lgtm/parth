import React from 'react';
import { Home, Search, MessageCircle, User, Receipt } from 'lucide-react';
import { useStore } from '../lib/store';
import { CDark, liquidGlassStyle, radii, fonts } from '../lib/tokens';
import type { ScreenName } from '../types';

export function BottomNav() {
  const { screen, setScreen } = useStore();

  const tabs: { id: ScreenName; icon: React.ReactNode; label: string }[] = [
    { id: 'home', icon: <Home size={22} />, label: 'Home' },
    { id: 'discover', icon: <Search size={22} />, label: 'Search' },
    { id: 'transactions', icon: <Receipt size={22} />, label: 'Pay' },
    { id: 'chat', icon: <MessageCircle size={22} />, label: 'Messages' },
    { id: 'myProfile', icon: <User size={22} />, label: 'Profile' },
  ];

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      ...liquidGlassStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
      maxWidth: '430px',
      margin: '0 auto',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setScreen(tab.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            background: 'none',
            border: 'none',
            color: screen === tab.id ? CDark.primary : CDark.muted,
            cursor: 'pointer',
            padding: '4px 12px',
            fontFamily: fonts.body,
            fontSize: '10px',
            fontWeight: screen === tab.id ? 600 : 400,
            transition: 'color 0.15s ease',
            flex: 1,
          }}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
