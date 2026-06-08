import { useState } from 'react';
import { useStore } from '../lib/store';
import { C, pageStyle, inputStyle } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import { GhostButton } from '../components/GhostButton';
import type { Language } from '../types';

const TAGLINES: Record<Language, string> = {
  en: 'Connect with embroidery professionals across India — machines, designers, karigars & more',
  hi: 'भारत के कढ़ाई पेशेवरों से जुड़ें — मशीनें, डिज़ाइनर, कारीगर',
  gu: 'ભારતના ભરત વ્યાવસાયિકો સાથે જોડાઓ',
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.3436 0-4.3282-1.5836-5.036-3.7105H.9574v2.3318C2.4382 15.9832 5.4818 18 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71c-.18-.54-.2827-1.1168-.2827-1.71s.1023-1.17.2827-1.71V4.9582H.9574C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9574 4.0418L3.964 10.71z" fill="#FBBC05"/>
      <path d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5813C13.4632.8918 11.4259 0 9 0 5.4818 0 2.4382 2.0168.9574 4.9582L3.964 7.29C4.6718 5.1632 6.6564 3.5795 9 3.5795z" fill="#EA4335"/>
    </svg>
  );
}

export function WelcomeScreen() {
  const { language, setScreen, handleSignIn, handleGoogleSignIn, loading } = useStore();
  const [showSignIn, setShowSignIn] = useState(false);
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  const onSignIn = async () => {
    setSignInError('');
    try {
      await handleSignIn(siEmail, siPassword);
    } catch (e) {
      setSignInError((e as Error).message);
    }
  };

  const onGoogleSignIn = async () => {
    console.log('[WelcomeScreen] Google Sign-In button clicked');
    setSignInError('');
    try {
      await handleGoogleSignIn();
      console.log('[WelcomeScreen] Google Sign-In completed successfully');
    } catch (e) {
      console.error('[WelcomeScreen] Google Sign-In error:', e);
      setSignInError((e as Error).message);
    }
  };

  return (
    <div style={{ ...pageStyle, padding: '0 24px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{ fontSize: '80px', filter: `drop-shadow(0 0 32px ${C.gold}80)`, marginBottom: '24px' }}>🪡</div>
        <h1 style={{
          fontSize: '34px', fontWeight: 800, color: C.text, margin: '0 0 16px',
          letterSpacing: '-0.03em', lineHeight: 1.15,
        }}>
          Embroidery<br />Marketplace
        </h1>
        <p style={{ color: C.textSoft, fontSize: '15px', lineHeight: 1.65, maxWidth: '300px', margin: '0 auto' }}>
          {TAGLINES[language]}
        </p>
      </div>

      {!showSignIn ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Google Sign-In — primary CTA */}
          <button
            onClick={onGoogleSignIn}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: '#fff', color: '#1f1f1f', border: 'none',
              borderRadius: '14px', padding: '14px 24px', width: '100%',
              fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <GoogleIcon />
            {loading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: C.textMuted, fontSize: '13px' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <PrimaryButton onClick={() => setScreen('signup')}>Create Account with Email</PrimaryButton>
          <GhostButton onClick={() => setShowSignIn(true)}>Sign In with Email</GhostButton>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {signInError && (
            <div style={{
              background: C.rose + '18', border: `1px solid ${C.rose}44`,
              borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: C.rose,
            }}>
              {signInError}
            </div>
          )}

          <button
            onClick={onGoogleSignIn}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: '#fff', color: '#1f1f1f', border: 'none',
              borderRadius: '14px', padding: '14px 24px', width: '100%',
              fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: C.textMuted, fontSize: '13px' }}>or email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={siEmail}
            onChange={e => setSiEmail(e.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={siPassword}
            onChange={e => setSiPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSignIn()}
          />
          <PrimaryButton onClick={onSignIn} disabled={loading || !siEmail || !siPassword}>
            {loading ? 'Signing in...' : 'Sign In'}
          </PrimaryButton>
          <GhostButton onClick={() => setShowSignIn(false)}>Back</GhostButton>
        </div>
      )}

      <p style={{ textAlign: 'center', color: C.textMuted, fontSize: '12px', marginTop: '24px' }}>
        Trusted by 10,000+ embroidery professionals
      </p>
    </div>
  );
}
