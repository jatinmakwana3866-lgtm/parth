import { C } from '../lib/tokens';

interface Props {
  available: boolean;
}

export function AvailabilityDot({ available }: Props) {
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: available ? C.jade : C.textMuted,
      flexShrink: 0,
    }} />
  );
}
