import React from 'react';
import { ROLES } from '../data/roles';

interface Props {
  roleId: string;
  style?: React.CSSProperties;
}

export function RoleBadge({ roleId, style }: Props) {
  const role = ROLES.find(r => r.id === roleId);
  if (!role) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 10px',
      borderRadius: '20px',
      background: role.color + '33',
      color: role.color,
      fontSize: '12px',
      fontWeight: 600,
      ...style,
    }}>
      {role.icon} {role.name.en}
    </span>
  );
}
