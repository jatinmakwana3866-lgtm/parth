import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, glassStyle } from '../lib/tokens';
import { RoleBadge } from '../components/RoleBadge';
import { AvailabilityDot } from '../components/AvailabilityDot';
import { ROLES } from '../data/roles';
import {
  sendFirebaseMessage,
  subscribeToMessages,
  getOrCreateChat,
} from '../lib/firebaseChat';
import type { FirebaseMessage } from '../lib/firebaseChat';

interface DisplayMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  time: string;
}

function formatMsgTime(ts: { seconds: number } | null | undefined): string {
  if (!ts) return '';
  const d = new Date(ts.seconds * 1000);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function ChatThreadScreen() {
  const chatUser = useStore(s => s.chatUser);
  const storeMsgs = useStore(s => s.messages);
  const sendStoredMsg = useStore(s => s.sendMessage);
  const setScreen = useStore(s => s.setScreen);
  const firebaseUser = useStore(s => s.firebaseUser);
  const activeChatId = useStore(s => s.activeChatId);
  const activeChatOtherUid = useStore(s => s.activeChatOtherUid);
  const activeChatOtherName = useStore(s => s.activeChatOtherName);
  const activeChatOtherPhoto = useStore(s => s.activeChatOtherPhoto);

  const [input, setInput] = useState('');
  const [fbMessages, setFbMessages] = useState<FirebaseMessage[]>([]);
  const [chatId, setChatId] = useState<string | null>(activeChatId || null);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const isFirebaseMode = !!firebaseUser && (!!activeChatId || !!activeChatOtherUid);
  const myUid = firebaseUser?.uid || '';

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [fbMessages, storeMsgs]);

  // Subscribe to Firestore messages
  useEffect(() => {
    if (!isFirebaseMode) return;

    let unsub: (() => void) | undefined;

    (async () => {
      let resolvedChatId = activeChatId;

      if (!resolvedChatId && activeChatOtherUid) {
        resolvedChatId = await getOrCreateChat(
          myUid,
          firebaseUser?.displayName || '',
          firebaseUser?.photoURL || '',
          activeChatOtherUid,
          activeChatOtherName || 'User',
          activeChatOtherPhoto || '',
        );
        setChatId(resolvedChatId);
      }

      if (resolvedChatId) {
        setChatId(resolvedChatId);
        unsub = subscribeToMessages(resolvedChatId, setFbMessages);
      }
    })();

    return () => unsub?.();
  }, [isFirebaseMode, activeChatId, activeChatOtherUid, myUid]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');

    if (isFirebaseMode) {
      if (!chatId && !activeChatOtherUid) return;
      setSending(true);
      try {
        let resolvedChatId = chatId;
        if (!resolvedChatId && activeChatOtherUid) {
          resolvedChatId = await getOrCreateChat(
            myUid,
            firebaseUser?.displayName || '',
            firebaseUser?.photoURL || '',
            activeChatOtherUid,
            activeChatOtherName || 'User',
            activeChatOtherPhoto || '',
          );
          setChatId(resolvedChatId);
        }
        if (resolvedChatId) {
          await sendFirebaseMessage(resolvedChatId, myUid, activeChatOtherUid || '', text);
        }
      } finally {
        setSending(false);
      }
    } else {
      sendStoredMsg(text);
    }
  };

  // Build display messages
  const displayMessages: DisplayMessage[] = isFirebaseMode
    ? fbMessages.map(m => ({
        id: m.id,
        from: m.senderUid === myUid ? 'me' : 'them',
        text: m.text,
        time: formatMsgTime(m.createdAt as any),
      }))
    : storeMsgs.map(m => ({ ...m, id: String(m.id) }));

  // Determine header info
  const headerName = isFirebaseMode
    ? (activeChatOtherName || 'User')
    : (chatUser?.name || 'Chat');
  const headerPhoto = isFirebaseMode ? activeChatOtherPhoto : undefined;
  const headerRole = chatUser?.role;
  const role = headerRole ? ROLES.find(r => r.id === headerRole) : null;
  const initials = headerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  if (!chatUser && !isFirebaseMode) return null;

  return (
    <div style={{
      background: `radial-gradient(ellipse at 15% 0%, rgba(212,168,83,0.10) 0%, transparent 55%), #0A0E1A`,
      minHeight: '100vh', maxWidth: '430px', margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
      color: C.text,
    }}>
      {/* Header */}
      <div style={{
        padding: '52px 20px 14px',
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => setScreen('chat')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textSoft, flexShrink: 0 }}
        >
          <ArrowLeft size={22} />
        </button>

        {/* Avatar */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          background: headerPhoto ? 'transparent' : (role ? `${role.color}22` : 'linear-gradient(135deg,#D4A853,#7A5520)'),
          border: `1.5px solid rgba(212,168,83,0.3)`,
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px',
        }}>
          {headerPhoto
            ? <img src={headerPhoto} alt={headerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (role ? role.icon : <span style={{ fontWeight: 800, fontSize: '14px', color: '#0A0E1A' }}>{initials}</span>)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {headerName}
          </div>
          {chatUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {headerRole && <RoleBadge roleId={headerRole} style={{ fontSize: '11px' }} />}
              <AvailabilityDot available={chatUser.available} />
            </div>
          )}
          {isFirebaseMode && (
            <div style={{ fontSize: '11px', color: C.jade }}>● Online</div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayMessages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: C.textMuted, fontSize: '14px' }}>
            Start the conversation 👋
          </div>
        )}
        {displayMessages.map(msg => (
          <div
            key={msg.id}
            style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{
              maxWidth: '75%',
              ...(msg.from === 'me' ? {
                background: 'rgba(212,168,83,0.15)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(212,168,83,0.25)',
                borderRadius: '18px 18px 4px 18px',
              } : {
                ...glassStyle,
                borderRadius: '18px 18px 18px 4px',
              }),
              padding: '10px 14px',
            }}>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.55, color: C.text, wordBreak: 'break-word' }}>{msg.text}</p>
              {msg.time && (
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: C.textMuted, textAlign: 'right' }}>{msg.time}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '12px 16px max(16px, env(safe-area-inset-bottom))',
        background: 'rgba(17,24,39,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: '10px',
        position: 'sticky', bottom: 0,
      }}>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textSoft }}>
          <Paperclip size={20} />
        </button>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: C.textSoft }}>
          <Mic size={20} />
        </button>
        <input
          style={{
            flex: 1, background: '#1C2438', border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '22px', padding: '10px 16px', color: C.text,
            fontSize: '14px', outline: 'none', fontFamily: 'inherit',
          }}
          placeholder="Message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: input.trim() && !sending ? 'linear-gradient(135deg, #D4A853, #7A5520)' : 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: input.trim() && !sending ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <Send size={16} color={input.trim() && !sending ? '#0A0E1A' : C.textMuted} />
        </button>
      </div>
    </div>
  );
}
