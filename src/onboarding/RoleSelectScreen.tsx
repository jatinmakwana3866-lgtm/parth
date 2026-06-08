import { Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackButton } from '../components/BackButton';
import { ROLES } from '../data/roles';
import type { Language } from '../types';

const TITLES: Record<Language, string> = {
  en: 'What best describes you?',
  hi: 'आप क्या हैं?',
  gu: 'તમે શું છો?',
};

export function RoleSelectScreen() {
  const language = useStore(s => s.language);
  const selectedRole = useStore(s => s.selectedRole);
  const setSelectedRole = useStore(s => s.setSelectedRole);
  const setScreen = useStore(s => s.setScreen);

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('signup')} />
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: '16px 0 8px', letterSpacing: '-0.02em' }}>
        {TITLES[language]}
      </h1>
      <p style={{ color: C.textSoft, fontSize: '14px', marginBottom: '28px' }}>
        Select your role in the embroidery industry
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
        {ROLES.map(role => {
          const selected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              style={{
                ...glassStyle,
                padding: '16px 14px',
                cursor: 'pointer',
                position: 'relative',
                border: selected ? `1.5px solid ${role.color}` : `1px solid ${C.glassBorder}`,
                background: selected ? `${role.color}18` : C.glassBg,
                transition: 'all 0.2s ease',
              }}
            >
              {selected && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={11} color="#0A0E1A" strokeWidth={3} />
                </div>
              )}
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{role.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px', lineHeight: 1.3 }}>
                {role.name[language]}
              </div>
              <div style={{ fontSize: '11px', color: C.textSoft, lineHeight: 1.4 }}>
                {role.desc[language]}
              </div>
            </div>
          );
        })}
      </div>

      <PrimaryButton
        disabled={!selectedRole}
        onClick={() => setScreen('profileSetup')}
      >
        Continue
      </PrimaryButton>
    </div>
  );
}
