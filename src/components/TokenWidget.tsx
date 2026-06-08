import { useStore } from '../lib/store';
import { C } from '../lib/tokens';

export function TokenWidget() {
  const { user, setScreen } = useStore();

  return (
    <button
      onClick={() => setScreen('tokenWallet')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(212,168,83,0.12)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(212,168,83,0.25)',
        borderRadius: '20px',
        padding: '6px 14px',
        color: C.gold,
        fontFamily: 'inherit',
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      🪙 {user.tokens}
    </button>
  );
}
