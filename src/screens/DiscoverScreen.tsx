import { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Lock, Star, MapPin } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, inputStyle } from '../lib/tokens';
import { BottomNav } from '../components/BottomNav';
import { TokenWidget } from '../components/TokenWidget';
import { RoleBadge } from '../components/RoleBadge';
import { AvailabilityDot } from '../components/AvailabilityDot';
import { ROLES } from '../data/roles';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function DiscoverScreen() {
  const userList = useStore(s => s.userList);
  const setScreen = useStore(s => s.setScreen);
  const [query, setQuery] = useState('');
  const [activeRole, setActiveRole] = useState('all');
  const debouncedQuery = useDebounce(query, 300);

  const filtered = useMemo(() => {
    return userList.filter(u => {
      const matchRole = activeRole === 'all' || u.role === activeRole;
      const q = debouncedQuery.toLowerCase();
      const matchQuery = q === '' ||
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [userList, debouncedQuery, activeRole]);

  const handleProfileClick = useCallback((u: typeof userList[0]) => {
    useStore.setState({ profileView: u });
    setScreen('profileView');
  }, [setScreen]);

  return (
    <div style={{ ...pageStyle, paddingBottom: '80px' }}>
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>Discover</h1>
        <TokenWidget />
      </div>

      <div style={{ padding: '0 24px 16px', position: 'relative' }}>
        <Search size={16} color={C.textMuted} style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          style={{ ...inputStyle, paddingLeft: '42px' }}
          placeholder="Search by name, role, city..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div style={{ overflowX: 'auto', padding: '0 24px 20px', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', gap: '8px', width: 'max-content' }}>
          <button
            onClick={() => setActiveRole('all')}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: 'none',
              background: activeRole === 'all' ? C.gold : 'rgba(255,255,255,0.08)',
              color: activeRole === 'all' ? '#0A0E1A' : C.textSoft,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', transition: 'all 0.15s ease',
            }}
          >
            All
          </button>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role.id)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none',
                background: activeRole === role.id ? C.gold : 'rgba(255,255,255,0.08)',
                color: activeRole === role.id ? '#0A0E1A' : C.textSoft,
                fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              }}
            >
              {role.icon} {role.name.en}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.textSoft }}>
            <Search size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0 }}>No profiles found</p>
          </div>
        )}
        {filtered.map(u => {
          const role = ROLES.find(r => r.id === u.role);
          return (
            <div
              key={u.id}
              onClick={() => handleProfileClick(u)}
              style={{ ...glassStyle, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                background: `${role?.color || C.gold}22`,
                border: `1.5px solid ${role?.color || C.gold}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px',
              }}>
                {role?.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                  {!u.unlocked && <Lock size={13} color={C.textMuted} />}
                </div>
                <RoleBadge roleId={u.role} style={{ marginBottom: '6px' }} />
                <p style={{ fontSize: '12px', color: C.textSoft, margin: '0 0 6px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.bio}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: C.gold, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Star size={11} /> {u.rating}
                  </span>
                  <span style={{ fontSize: '12px', color: C.textSoft, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={11} /> {u.city}
                  </span>
                  <AvailabilityDot available={u.available} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
