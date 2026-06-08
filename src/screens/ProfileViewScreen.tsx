import { MapPin, Lock, X, Shield } from 'lucide-react';
import { useStore } from '../lib/store';
import { C, pageStyle, glassStyle, goldGlassStyle } from '../lib/tokens';
import { BackButton } from '../components/BackButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { GhostButton } from '../components/GhostButton';
import { RoleBadge } from '../components/RoleBadge';
import { AvailabilityDot } from '../components/AvailabilityDot';
import { ROLES } from '../data/roles';

export function ProfileViewScreen() {
  const profileView = useStore(s => s.profileView);
  const user = useStore(s => s.user);
  const unlockModal = useStore(s => s.unlockModal);
  const unlockSuccess = useStore(s => s.unlockSuccess);
  const unlockLoading = useStore(s => s.unlockLoading);
  const openUnlockModal = useStore(s => s.openUnlockModal);
  const closeUnlockModal = useStore(s => s.closeUnlockModal);
  const confirmUnlock = useStore(s => s.confirmUnlock);
  const setScreen = useStore(s => s.setScreen);

  if (!profileView) return null;

  const role = ROLES.find(r => r.id === profileView.role);
  const cost = profileView.role === 'vyapari' ? 10 : 1;
  const hasSufficientTokens = user.tokens >= cost;

  return (
    <div style={{ ...pageStyle, paddingBottom: '40px' }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${role?.color || C.gold}22 0%, transparent 100%)`,
        padding: '56px 24px 28px',
        position: 'relative',
      }}>
        <BackButton onClick={() => setScreen('discover')} />

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: `${role?.color || C.gold}22`,
            border: `2px solid ${role?.color || C.gold}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 14px',
          }}>
            {role?.icon}
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.text, margin: '0 0 6px' }}>
            {profileView.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{
              background: C.gold + '22', color: C.gold,
              padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
            }}>
              ⭐ {profileView.rating}
            </span>
            <RoleBadge roleId={profileView.role} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
            <AvailabilityDot available={profileView.available} />
            <span style={{ fontSize: '13px', color: C.textSoft }}>{profileView.available ? 'Available' : 'Busy'}</span>
            <span style={{ color: C.textMuted }}>•</span>
            <MapPin size={13} color={C.textSoft} />
            <span style={{ fontSize: '13px', color: C.textSoft }}>{profileView.city}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Rating', value: profileView.rating },
          { label: 'Reviews', value: profileView.reviews },
          { label: 'Status', value: profileView.available ? 'Active' : 'Busy' },
        ].map((s, i) => (
          <div key={i} style={{ ...glassStyle, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: C.text, marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: C.textSoft }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div style={{ padding: '0 24px', marginBottom: '24px' }}>
        <div style={{ ...glassStyle, padding: '18px 20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: C.textSoft, margin: '0 0 10px' }}>About</h3>
          <p style={{ fontSize: '14px', color: C.text, margin: 0, lineHeight: 1.65 }}>{profileView.bio}</p>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px' }}>
        {profileView.unlocked ? (
          <PrimaryButton onClick={() => { useStore.setState({ chatUser: profileView }); setScreen('chatThread'); }}>
            💬 Message {profileView.name.split(' ')[0]}
          </PrimaryButton>
        ) : (
          <>
            <div style={{ ...goldGlassStyle, padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={18} color={C.gold} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: C.gold, marginBottom: '2px' }}>Contact Locked</div>
                <div style={{ fontSize: '12px', color: C.textSoft }}>Unlock to chat directly with this professional</div>
              </div>
            </div>
            <PrimaryButton onClick={() => openUnlockModal(profileView)}>
              🔓 Unlock Chat — {cost} Token{cost > 1 ? 's' : ''}
            </PrimaryButton>
            <p style={{ textAlign: 'center', fontSize: '12px', color: C.textMuted, marginTop: '10px' }}>
              Your balance: 🪙 {user.tokens} tokens
            </p>
          </>
        )}
      </div>

      {/* Unlock Modal */}
      {unlockModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 200, maxWidth: '430px', margin: '0 auto',
        }}>
          <div style={{
            ...glassStyle,
            borderRadius: '28px 28px 0 0',
            padding: '28px 24px 48px',
            width: '100%',
            background: 'rgba(17,24,39,0.98)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: C.text, margin: 0 }}>Unlock Chat</h2>
              <button onClick={closeUnlockModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} color={C.textSoft} />
              </button>
            </div>

            <div style={{ ...glassStyle, padding: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: `${ROLES.find(r => r.id === unlockModal.role)?.color || C.gold}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0,
              }}>
                {ROLES.find(r => r.id === unlockModal.role)?.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: C.text, fontSize: '15px' }}>{unlockModal.name}</div>
                <RoleBadge roleId={unlockModal.role} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ color: C.textSoft, fontSize: '14px' }}>Cost</span>
              <span style={{ color: C.gold, fontWeight: 700, fontSize: '15px' }}>
                🪙 {unlockModal.role === 'vyapari' ? 10 : 1} token{unlockModal.role === 'vyapari' ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ color: C.textSoft, fontSize: '14px' }}>Your balance</span>
              <span style={{ color: C.text, fontWeight: 700, fontSize: '15px' }}>🪙 {user.tokens}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: '12px', borderRadius: '12px', background: C.jade + '11' }}>
              <Shield size={15} color={C.jade} />
              <span style={{ fontSize: '13px', color: C.jade }}>Once unlocked, chat is free forever</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {hasSufficientTokens ? (
                <PrimaryButton onClick={confirmUnlock} disabled={unlockLoading}>
                  {unlockLoading ? 'Unlocking...' : 'Unlock Now'}
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => { setScreen('buyTokens'); closeUnlockModal(); }}>
                  Buy More Tokens
                </PrimaryButton>
              )}
              <GhostButton onClick={closeUnlockModal}>Cancel</GhostButton>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {unlockSuccess && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          ...goldGlassStyle, padding: '12px 24px', zIndex: 300,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: C.jade, fontWeight: 700, fontSize: '14px' }}>Chat unlocked! ✓</span>
        </div>
      )}
    </div>
  );
}
