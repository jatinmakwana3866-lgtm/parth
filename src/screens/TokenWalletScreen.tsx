import { Gift, ShoppingBag, Users, ArrowDownLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import type { Transaction } from '../types';

function TxIcon({ type }: { type: Transaction['type'] }) {
  const icons = {
    gift: <Gift size={16} color={C.jade} />,
    spend: <ArrowDownLeft size={16} color={C.rose} />,
    purchase: <ShoppingBag size={16} color={C.gold} />,
    referral: <Users size={16} color={C.sky} />,
  };
  return icons[type];
}

function TxColor(type: Transaction['type']) {
  return { gift: C.jade, spend: C.rose, purchase: C.gold, referral: C.sky }[type];
}

export function TokenWalletScreen() {
  const user = useStore(s => s.user);
  const transactions = useStore(s => s.transactions);
  const setScreen = useStore(s => s.setScreen);

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('home')} />
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: '16px 0 28px', letterSpacing: '-0.02em' }}>
        Token Wallet
      </h1>

      <div style={{ ...goldGlassStyle, padding: '28px 24px', textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🪙</div>
        <div style={{ fontSize: '56px', fontWeight: 800, color: C.gold, lineHeight: 1, marginBottom: '4px' }}>
          {user.tokens}
        </div>
        <div style={{ fontSize: '14px', color: C.textSoft, marginBottom: '20px' }}>EM Tokens</div>
        <PrimaryButton onClick={() => setScreen('buyTokens')} style={{ maxWidth: '220px', margin: '0 auto' }}>
          Buy More Tokens
        </PrimaryButton>
      </div>

      <div style={{ ...glassStyle, padding: '16px 20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: C.textSoft, margin: '0 0 12px' }}>Token Cost</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: C.text }}>Standard contact unlock</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: C.gold }}>🪙 1 token</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: C.text }}>Vyapari contact unlock</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: C.gold }}>🪙 10 tokens</span>
        </div>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 700, color: C.text, margin: '0 0 14px' }}>History</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {transactions.length === 0 && (
          <p style={{ color: C.textSoft, fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>No transactions yet</p>
        )}
        {transactions.map(tx => (
          <div key={tx.id} style={{ ...glassStyle, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              background: TxColor(tx.type) + '18',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TxIcon type={tx.type} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.text}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>{tx.time}</div>
            </div>
            <div style={{
              fontSize: '15px', fontWeight: 700, flexShrink: 0,
              color: tx.delta.startsWith('+') ? C.jade : C.rose,
            }}>
              {tx.delta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
