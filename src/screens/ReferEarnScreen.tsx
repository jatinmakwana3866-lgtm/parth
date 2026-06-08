import { Copy, Share2, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BackButton } from '../components/BackButton';
import { GhostButton } from '../components/GhostButton';

const SHARE_BTNS = [
  { emoji: '💬', label: 'WhatsApp' },
  { emoji: '📱', label: 'SMS' },
  { emoji: '✈️', label: 'Telegram' },
  { emoji: '📘', label: 'Facebook' },
  { emoji: '📋', label: 'Copy' },
];

const STEPS = [
  { num: 1, title: 'Share your link', desc: 'Send your unique referral link to friends in the industry' },
  { num: 2, title: 'They sign up', desc: 'Your friend creates an account using your link' },
  { num: 3, title: 'Both earn tokens', desc: 'You get 2 tokens, they get 1 free token to start' },
];

export function ReferEarnScreen() {
  const copied = useStore(s => s.copied);
  const user = useStore(s => s.user);
  const setCopySuccess = useStore(s => s.setCopySuccess);
  const setScreen = useStore(s => s.setScreen);
  const referralLink = `embroidery.app/ref/${user.name.replace(/\s/g, '').slice(0, 8).toLowerCase() || 'em'}8472`;

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('home')} />
      </div>

      <div style={{ ...goldGlassStyle, padding: '28px 24px', textAlign: 'center', marginBottom: '20px', marginTop: '16px' }}>
        <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎁</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.gold, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Earn 2 Free Tokens Per Friend!
        </h1>
        <p style={{ color: C.textSoft, fontSize: '13px', margin: 0 }}>
          Share with embroidery professionals and earn tokens
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Referrals', value: '0' },
          { label: 'Tokens Earned', value: '0' },
          { label: 'Pending', value: '0' },
        ].map((s, i) => (
          <div key={i} style={{ ...glassStyle, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: C.text, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: C.textSoft }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ ...glassStyle, padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: C.textSoft, marginBottom: '10px' }}>Your referral link</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            flex: 1, background: C.surface2, borderRadius: '10px',
            padding: '10px 14px', fontSize: '13px', color: C.gold,
            fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {referralLink}
          </div>
          <button
            onClick={setCopySuccess}
            style={{
              background: copied ? C.jade + '22' : 'rgba(212,168,83,0.12)',
              border: `1px solid ${copied ? C.jade : C.gold}44`,
              borderRadius: '10px', padding: '10px 14px',
              color: copied ? C.jade : C.gold, cursor: 'pointer',
              fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '5px',
              transition: 'all 0.15s ease', whiteSpace: 'nowrap', flexShrink: 0,
            }}
          >
            <Copy size={14} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <GhostButton style={{ padding: '11px 0' }}>
          <Share2 size={15} style={{ marginRight: '6px' }} />
          Share Link
        </GhostButton>
      </div>

      <div style={{ ...glassStyle, padding: '18px 20px', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: C.textSoft, marginBottom: '14px' }}>Share via</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {SHARE_BTNS.map(s => (
            <button
              key={s.label}
              style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px',
                padding: '12px 6px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{s.emoji}</div>
              <div style={{ fontSize: '10px', color: C.textSoft }}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: '0 0 14px' }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {STEPS.map(step => (
            <div key={step.num} style={{ ...glassStyle, padding: '16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #D4A853, #7A5520)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 800, color: '#0A0E1A',
              }}>
                {step.num}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '3px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: C.textSoft, lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: C.jade + '11',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${C.jade}33`,
        borderRadius: '16px', padding: '14px 16px',
        display: 'flex', gap: '10px', alignItems: 'flex-start',
      }}>
        <Shield size={16} color={C.jade} style={{ flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: '13px', color: C.jade, margin: 0, lineHeight: 1.55 }}>
          Tokens are credited only when your referred friend completes signup and verifies their phone number.
        </p>
      </div>
    </div>
  );
}
