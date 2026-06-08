import { Bell, Briefcase, Eye, Star, Search, Zap, Gift, ShoppingBag, Settings, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BottomNav } from '../components/BottomNav';
import { RoleBadge } from '../components/RoleBadge';
import { TokenWidget } from '../components/TokenWidget';
import { AvailabilityDot } from '../components/AvailabilityDot';
import { ROLES } from '../data/roles';

const ACTIONS = [
  { label: 'Browse Work', icon: <Search size={22} />, color: C.sky, screen: 'discover' as const },
  { label: 'Post Job', icon: <Briefcase size={22} />, color: C.jade, screen: 'discover' as const },
  { label: '🚨 Emergency', icon: <Zap size={22} />, color: C.rose, screen: 'discover' as const, tint: true },
  { label: 'Refer & Earn', icon: <Gift size={22} />, color: C.gold, screen: 'referEarn' as const },
  { label: 'Buy Tokens', icon: <ShoppingBag size={22} />, color: C.amber, screen: 'buyTokens' as const },
  { label: 'Settings', icon: <Settings size={22} />, color: C.textSoft, screen: 'myProfile' as const },
];

export function HomeScreen() {
  const user = useStore(s => s.user);
  const userList = useStore(s => s.userList);
  const setScreen = useStore(s => s.setScreen);

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ ...pageStyle, paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ padding: '56px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: C.textSoft, fontSize: '13px', margin: '0 0 4px' }}>{greeting} 👋</p>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: C.text, margin: '0 0 6px', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name || 'Welcome!'}
          </h1>
          <RoleBadge roleId={user.role} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <TokenWidget />
          {user.photoURL ? (
            <button
              onClick={() => setScreen('myProfile')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', borderRadius: '50%', overflow: 'hidden', width: '32px', height: '32px' }}
            >
              <img src={user.photoURL} alt={user.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%', border: '1.5px solid rgba(212,168,83,0.4)' }} />
            </button>
          ) : (
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <Bell size={22} color={C.textSoft} />
            </button>
          )}
        </div>
      </div>

      {/* Stats scroll */}
      <div style={{ overflowX: 'auto', padding: '0 24px', marginBottom: '24px', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
          {[
            { label: 'Active Jobs', value: '3', icon: <Briefcase size={18} />, color: C.sky },
            { label: 'Profile Views', value: '128', icon: <Eye size={18} />, color: C.jade },
            { label: 'Rating', value: '4.8', icon: <Star size={18} />, color: C.gold },
            { label: 'Tokens', value: String(user.tokens), icon: <span style={{fontSize:'18px'}}>🪙</span>, color: C.gold },
          ].map((s, i) => (
            <div key={i} style={{ ...glassStyle, padding: '16px 20px', minWidth: '120px' }}>
              <div style={{ color: s.color, marginBottom: '6px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: C.text, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: C.textSoft, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '0 24px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: '0 0 14px' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {ACTIONS.map((a, i) => (
            <button
              key={i}
              onClick={() => setScreen(a.screen)}
              style={{
                ...glassStyle,
                padding: '16px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                cursor: 'pointer', border: 'none', fontFamily: 'inherit',
                background: a.tint ? `rgba(232,81,106,0.12)` : C.glassBg,
                borderColor: a.tint ? `rgba(232,81,106,0.3)` : C.glassBorder,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ color: a.color }}>{a.icon}</div>
              <span style={{ fontSize: '11px', color: C.textSoft, textAlign: 'center', lineHeight: 1.3 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby profiles */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: 0 }}>Nearby Professionals</h2>
          <button onClick={() => setScreen('discover')} style={{ background: 'none', border: 'none', color: C.gold, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div style={{ overflowX: 'auto', padding: '0 24px', scrollbarWidth: 'none' }}>
          <div style={{ display: 'flex', gap: '12px', width: 'max-content' }}>
            {userList.slice(0, 5).map((u) => {
              const role = ROLES.find(r => r.id === u.role);
              return (
                <div
                  key={u.id}
                  onClick={() => { useStore.setState({ profileView: u }); setScreen('profileView'); }}
                  style={{ ...glassStyle, padding: '16px', minWidth: '148px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: `${role?.color || C.gold}22`,
                    border: `1.5px solid ${role?.color || C.gold}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', marginBottom: '10px',
                  }}>
                    {role?.icon}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                    <AvailabilityDot available={u.available} />
                    <span style={{ fontSize: '11px', color: C.textSoft }}>{u.city}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: C.gold }}>⭐ {u.rating}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Refer banner */}
      <div style={{ padding: '0 24px' }}>
        <div
          onClick={() => setScreen('referEarn')}
          style={{ ...goldGlassStyle, padding: '18px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: C.gold, marginBottom: '4px' }}>🎁 Refer & Earn</div>
            <div style={{ fontSize: '12px', color: C.textSoft }}>Get 2 free tokens for every friend you refer</div>
          </div>
          <ChevronRight size={18} color={C.gold} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
