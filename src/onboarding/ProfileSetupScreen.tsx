import { Camera } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, inputStyle } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackButton } from '../components/BackButton';
import { ROLES } from '../data/roles';

export function ProfileSetupScreen() {
  const selectedRole = useStore(s => s.selectedRole);
  const formData = useStore(s => s.formData);
  const updateForm = useStore(s => s.updateForm);
  const setScreen = useStore(s => s.setScreen);
  const role = ROLES.find(r => r.id === selectedRole);

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('roleSelect')} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: C.textSoft }}>Step 3 of 4</span>
          <span style={{ fontSize: '13px', color: C.gold }}>75%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <div style={{
            height: '100%', width: '75%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #D4A853, #F0C97A)',
          }} />
        </div>
      </div>

      <h1 style={{ fontSize: '26px', fontWeight: 800, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        Your Profile
      </h1>
      <p style={{ color: C.textSoft, fontSize: '14px', marginBottom: '32px' }}>
        Help others find you in the marketplace
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4A853, #7A5520)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px',
          }}>
            {role?.icon || '👤'}
          </div>
          <div style={{
            position: 'absolute', bottom: 0, right: 0,
            width: '28px', height: '28px', borderRadius: '50%',
            background: C.surface2, border: `2px solid ${C.bg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={14} color={C.gold} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: C.textSoft, marginBottom: '8px', fontWeight: 500 }}>
            Business Name <span style={{ color: C.textMuted }}>(optional)</span>
          </label>
          <input
            style={inputStyle}
            placeholder="Your business or shop name"
            value={formData.businessName}
            onChange={e => updateForm('businessName', e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: C.textSoft, marginBottom: '8px', fontWeight: 500 }}>
            City
          </label>
          <input
            style={inputStyle}
            placeholder="Surat, Ahmedabad, Mumbai..."
            value={formData.city}
            onChange={e => updateForm('city', e.target.value)}
          />
        </div>
      </div>

      <PrimaryButton onClick={() => setScreen('welcomeGift')}>
        Continue
      </PrimaryButton>

      <button
        onClick={() => setScreen('welcomeGift')}
        style={{
          background: 'none', border: 'none', color: C.textSoft,
          fontSize: '14px', cursor: 'pointer', marginTop: '16px',
          display: 'block', width: '100%', textAlign: 'center',
          fontFamily: 'inherit',
        }}
      >
        Skip for now
      </button>
    </div>
  );
}
