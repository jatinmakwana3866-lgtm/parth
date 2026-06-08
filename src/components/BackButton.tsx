import { ArrowLeft } from 'lucide-react';
import { C } from '../lib/tokens';

interface Props {
  onClick: () => void;
}

export function BackButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: 'none',
        color: C.gold,
        cursor: 'pointer',
        padding: '8px 0',
        fontFamily: 'inherit',
        fontSize: '15px',
        fontWeight: 600,
      }}
    >
      <ArrowLeft size={20} />
      Back
    </button>
  );
}
