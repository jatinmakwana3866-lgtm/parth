import { Eye, EyeOff } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, inputStyle } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import { BackButton } from '../components/BackButton';
import { validatePassword } from '../lib/auth';

function getStrength(pw: string): number {
  if (pw.length === 0) return 0;
  if (pw.length < 4) return 1;
  if (pw.length < 6) return 2;
  if (pw.length < 8) return 3;
  return 4;
}

const STRENGTH_COLORS = ['', C.rose, C.amber, C.gold, C.jade];

export function SignupScreen() {
  const { formData, showPassword, passwordErrors, updateForm, togglePassword, setPasswordErrors, setScreen } = useStore();
  const strength = getStrength(formData.password);
  const canSubmit = formData.name.length > 0 && formData.email.length > 0 && formData.password.length >= 8;

  const handleSubmit = () => {
    const validation = validatePassword(formData.password);
    setPasswordErrors(validation.errors);
    if (!validation.valid) return;
    setScreen('roleSelect');
  };

  return (
    <div style={{ ...pageStyle, padding: '0 24px 48px' }}>
      <div style={{ paddingTop: '56px', marginBottom: '8px' }}>
        <BackButton onClick={() => setScreen('welcome')} />
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 800, color: C.text, margin: '16px 0 32px', letterSpacing: '-0.02em' }}>
        Create Account
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', color: C.textSoft, marginBottom: '8px', fontWeight: 500 }}>
            Full Name
          </label>
          <input
            style={inputStyle}
            placeholder="Rajesh Patel"
            value={formData.name}
            onChange={e => updateForm('name', e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: C.textSoft, marginBottom: '8px', fontWeight: 500 }}>
            Email
          </label>
          <input
            style={inputStyle}
            type="email"
            placeholder="rajesh@example.com"
            value={formData.email}
            onChange={e => updateForm('email', e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: C.textSoft, marginBottom: '8px', fontWeight: 500 }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              style={{ ...inputStyle, paddingRight: '48px' }}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={e => {
                updateForm('password', e.target.value);
                if (passwordErrors.length > 0) {
                  const validation = validatePassword(e.target.value);
                  setPasswordErrors(validation.errors);
                }
              }}
            />
            <button
              onClick={togglePassword}
              style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: C.textSoft, cursor: 'pointer', padding: '4px',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Strength bar */}
          {formData.password.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: '3px', borderRadius: '4px',
                    background: i <= strength ? STRENGTH_COLORS[strength] : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.2s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Password validation errors */}
          {passwordErrors.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {passwordErrors.map((err, i) => (
                <span key={i} style={{ fontSize: '12px', color: C.rose }}>{err}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '24px', lineHeight: 1.6 }}>
        By continuing, you agree to our{' '}
        <span style={{ color: C.gold }}>Terms of Service</span> and{' '}
        <span style={{ color: C.gold }}>Privacy Policy</span>
      </p>

      <PrimaryButton
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Continue
      </PrimaryButton>
    </div>
  );
}
