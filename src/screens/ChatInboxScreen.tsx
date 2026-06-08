import { useEffect, useState } from 'react';
import { Lock, MessageCircle } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle } from '../lib/tokens';
import { BottomNav } from '../components/BottomNav';
import { TokenWidget } from '../components/TokenWidget';
import { RoleBadge } from '../components/RoleBadge';
import { AvailabilityDot } from '../components/AvailabilityDot';
import { PrimaryButton } from '../components/PrimaryButton';
import { ROLES } from '../data/roles';
import { subscribeToChats } from '../lib/firebaseChat';
import type { FirebaseChat } from '../lib/firebaseChat';

export function ChatInboxScreen() {
  const userList = useStore(s => s.userList);
  const firebaseUser = useStore(s => s.firebaseUser);
  const setScreen = useStore(s => s.setScreen);
  const [firebaseChats, setFirebaseChats] = useState<FirebaseChat[]>([]);

  const unlockedUsers = userList.filter(u => u.unlocked);
  const lockedUsers = userList.filter(u => !u.unlocked);

  // Subscribe to real-time Firebase chats
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const unsub = subscribeToChats(firebaseUser.uid, setFirebaseChats);
    return unsub;
  }, [firebaseUser?.uid]);

  const openFirebaseChat = (chat: FirebaseChat) => {
    if (!firebaseUser) return;
    const otherUid = chat.participants.find(p => p !== firebaseUser.uid) || '';
    const otherName = chat.participantNames?.[otherUid] || 'User';
    const otherPhoto = chat.participantPhotos?.[otherUid] || '';
    useStore.setState({
      activeChatId: chat.id,
      activeChatOtherUid: otherUid,
      activeChatOtherName: otherName,
      activeChatOtherPhoto: otherPhoto,
    });
    setScreen('chatThread');
  };

  const openMockChat = (u: typeof userList[0]) => {
    useStore.setState({ chatUser: u, activeChatId: null, activeChatOtherUid: null });
    setScreen('chatThread');
  };

  const formatTime = (ts: { seconds: number } | null) => {
    if (!ts) return '';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ ...pageStyle, paddingBottom: '80px' }}>
      <div style={{ padding: '56px 24px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>Messages</h1>
        <TokenWidget />
      </div>

      {/* Firebase real-time chats */}
      {firebaseChats.length > 0 && (
        <div style={{ padding: '0 24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: C.gold, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Live Chats
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {firebaseChats.map(chat => {
              const otherUid = chat.participants.find(p => p !== firebaseUser?.uid) || '';
              const otherName = chat.participantNames?.[otherUid] || 'User';
              const otherPhoto = chat.participantPhotos?.[otherUid] || '';
              const initials = otherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={chat.id}
                  onClick={() => openFirebaseChat(chat)}
                  style={{ ...glassStyle, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: otherPhoto ? 'transparent' : 'linear-gradient(135deg, #D4A853, #7A5520)',
                    border: '2px solid rgba(212,168,83,0.3)',
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', fontWeight: 800, color: '#0A0E1A',
                  }}>
                    {otherPhoto
                      ? <img src={otherPhoto} alt={otherName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{otherName}</span>
                      <span style={{ fontSize: '11px', color: C.textMuted, flexShrink: 0, marginLeft: '8px' }}>{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: C.textSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {chat.lastMessage || 'Start chatting...'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unlocked marketplace contacts */}
      {unlockedUsers.length === 0 && firebaseChats.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>
            <MessageCircle size={56} color={C.textMuted} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: C.text, margin: '0 0 8px' }}>No conversations yet</h2>
          <p style={{ color: C.textSoft, fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
            Sign in with Google to chat with anyone, or unlock a professional's contact to start a conversation
          </p>
          <PrimaryButton onClick={() => setScreen('discover')} style={{ maxWidth: '240px', margin: '0 auto' }}>
            Browse Profiles
          </PrimaryButton>
        </div>
      ) : (
        unlockedUsers.length > 0 && (
          <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {firebaseChats.length > 0 && (
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: C.textSoft, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Unlocked Contacts
              </h3>
            )}
            {unlockedUsers.map(u => {
              const role = ROLES.find(r => r.id === u.role);
              return (
                <div
                  key={u.id}
                  onClick={() => openMockChat(u)}
                  style={{ ...glassStyle, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                    background: `${role?.color || C.gold}22`,
                    border: `1.5px solid ${role?.color || C.gold}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>
                    {role?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                      <AvailabilityDot available={u.available} />
                    </div>
                    <RoleBadge roleId={u.role} style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '12px', color: C.jade }}>Chat unlocked ✓</div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {lockedUsers.length > 0 && (
        <div style={{ padding: '0 24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.textSoft, margin: '0 0 12px' }}>
            More Professionals
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lockedUsers.slice(0, 4).map(u => {
              const role = ROLES.find(r => r.id === u.role);
              const cost = u.role === 'vyapari' ? 10 : 1;
              return (
                <div
                  key={u.id}
                  onClick={() => { useStore.setState({ profileView: u }); setScreen('profileView'); }}
                  style={{ ...glassStyle, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.7 }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  }}>
                    {role?.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.textSoft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>{role?.name.en}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: C.textMuted, fontSize: '12px', flexShrink: 0 }}>
                    <Lock size={12} />
                    <span>🪙 {cost}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
