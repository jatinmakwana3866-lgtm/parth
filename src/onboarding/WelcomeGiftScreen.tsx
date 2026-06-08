import { useStore } from '../lib/store';
import { C, pageStyle, goldGlassStyle } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import { GhostButton } from '../components/GhostButton';
import { RoleBadge } from '../components/RoleBadge';

export function WelcomeGiftScreen() {
  const { formData, selectedRole, tokenClaimDenied, completeOnboarding, loading } = useStore();
  const name = formData.name || 'Friend';

  return (
    <div style={{ ...pageStyle, padding: '0 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: '76px', filter: `drop-shadow(0 0 28px ${C.gold}80)`, marginBottom: '20px' }}>
          {tokenClaimDenied ? '🔒' : '🎁'}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          {tokenClaimDenied ? 'Welcome, ' + name + '!' : `Welcome, ${name}!`}
        </h1>

        {tokenClaimDenied ? (
          <>
            <p style={{ color: C.rose, fontSize: '15px', marginBottom: '20px' }}>
              Free token already claimed on this device
            </p>
            <p style={{ color: C.textSoft, fontSize: '13px', lineHeight: 1.6, marginBottom: '28px' }}>
              Purchase tokens to get started and unlock professional contacts
            </p>
          </>
        ) : (
          <>
            <p style={{ color: C.textSoft, fontSize: '15px', marginBottom: '16px' }}>You're In!</p>
          </>
        )}

        {selectedRole && (
          <div style={{ marginBottom: '28px' }}>
            <RoleBadge roleId={selectedRole} />
          </div>
        )}

        {!tokenClaimDenied && (
          <div style={{ ...goldGlassStyle, padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🪙</div>
            <div style={{ fontSize: '36px', fontWeight: 800, color: C.gold, lineHeight: 1 }}>1 Free</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: C.textSoft, marginBottom: '16px' }}>EM Token</div>
            <div style={{ height: '1px', background: 'rgba(212,168,83,0.2)', marginBottom: '16px' }} />
            <p style={{ color: C.textSoft, fontSize: '13px', lineHeight: 1.6, margin: '0 0 12px' }}>
              Use tokens to unlock direct contact with professionals in the marketplace
            </p>
            <p style={{ color: C.textMuted, fontSize: '12px', margin: 0, lineHeight: 1.5 }}>
              1 token = 1 contact unlock • Vyapari = 10 tokens
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <PrimaryButton onClick={completeOnboarding} disabled={loading}>
            {loading ? 'Setting up...' : 'Explore Marketplace →'}
          </PrimaryButton>
          {tokenClaimDenied && (
            <GhostButton onClick={() => completeOnboarding()}>
              Continue without free token
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
}
