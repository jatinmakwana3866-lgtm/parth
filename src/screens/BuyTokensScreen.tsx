import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BackButton } from '../components/BackButton';
import { TOKEN_PACKAGES } from '../data/tokenPackages';

export function BuyTokensScreen() {
  const buyPackage = useStore(s => s.buyPackage);
  const buySuccessPkg = useStore(s => s.buySuccessPkg);
  const setScreen = useStore(s => s.setScreen);

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('tokenWallet')} />
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: '16px 0 8px', letterSpacing: '-0.02em' }}>
        Buy Tokens
      </h1>
      <p style={{ color: C.textSoft, fontSize: '14px', marginBottom: '20px' }}>
        Unlock contacts to grow your business network
      </p>

      <div style={{ ...goldGlassStyle, padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>💼</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: C.gold }}>Vyapari Unlock = 10 Tokens</div>
          <div style={{ fontSize: '12px', color: C.textSoft }}>Other professionals cost just 1 token each</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {TOKEN_PACKAGES.map((pkg) => (
          <div
            key={pkg.name}
            onClick={() => buyPackage(pkg)}
            style={{
              ...(pkg.highlight ? goldGlassStyle : glassStyle),
              padding: '16px 20px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              ...(pkg.highlight ? { border: `1.5px solid ${C.gold}` } : {}),
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: C.text }}>{pkg.name}</span>
                {pkg.badge && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                    background: pkg.badge === 'BEST VALUE' ? C.gold : C.textMuted + '44',
                    color: pkg.badge === 'BEST VALUE' ? '#0A0E1A' : C.textSoft,
                  }}>
                    {pkg.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: pkg.highlight ? C.gold : C.text }}>
                🪙 {pkg.tokens} tokens
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: pkg.highlight ? C.gold : C.text }}>
                ₹{pkg.price}
              </div>
              <div style={{ fontSize: '11px', color: C.textMuted }}>
                ₹{(pkg.price / pkg.tokens).toFixed(0)}/token
              </div>
            </div>
          </div>
        ))}
      </div>

      {buySuccessPkg && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 300, maxWidth: '430px', margin: '0 auto',
        }}>
          <div style={{ ...goldGlassStyle, padding: '36px 32px', textAlign: 'center', width: '280px' }}>
            <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: C.gold, margin: '0 0 8px' }}>
              +{buySuccessPkg.tokens} Tokens Added!
            </h2>
            <p style={{ color: C.textSoft, fontSize: '14px', margin: 0 }}>
              {buySuccessPkg.name} pack purchased
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
