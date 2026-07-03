import { Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { CDark, pageStyle, glassStyle, goldGlassStyle, fonts } from '../lib/tokens';
import { PrimaryButton } from '../components/PrimaryButton';
import type { Language } from '../types';

const LANGS: { id: Language; flag: string; title: string; subtitle: string }[] = [
  { id: 'en', flag: '🇮🇳', title: 'English', subtitle: 'Continue in English' },
  { id: 'hi', flag: '🇮🇳', title: 'हिन्दी', subtitle: 'हिन्दी में जारी रखें' },
  { id: 'gu', flag: '🇮🇳', title: 'ગુજરાતી', subtitle: 'ગુજરાતીમાં આગળ વધો' },
];

const CTA: Record<Language, string> = { en: 'Continue', hi: 'जारी रखें', gu: 'આગળ' };

export function LanguageScreen() {
  const language = useStore(s => s.language);
  const setLanguage = useStore(s => s.setLanguage);
  const setScreen = useStore(s => s.setScreen);

  return (
    <div style={{ ...pageStyle, padding: '0 24px 40px' }}>
      <div style={{ paddingTop: '72px', textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '72px', filter: `drop-shadow(0 0 24px ${CDark.primary}66)`, marginBottom: '16px' }}>🪡</div>
        <h1 style={{
          fontFamily: fonts.display,
          fontSize: '28px',
          fontWeight: 800,
          color: CDark.foreground,
          margin: '0 0 8px',
          letterSpacing: '-0.025em'
        }}>
          Embroidery Marketplace
        </h1>
        <p style={{ color: CDark.muted, fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          कढ़ाई मार्केटप्लेस • ભરત માર્કેટપ્લેસ
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {LANGS.map(lang => (
          <div
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            style={{
              ...(language === lang.id ? goldGlassStyle : glassStyle),
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '28px' }}>{lang.flag}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: CDark.foreground }}>{lang.title}</div>
                <div style={{ fontSize: '13px', color: CDark.muted }}>{lang.subtitle}</div>
              </div>
            </div>
            {language === lang.id && (
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: CDark.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={14} color="#0A0E1A" strokeWidth={3} />
              </div>
            )}
          </div>
        ))}
      </div>

      <PrimaryButton onClick={() => setScreen('welcome')}>
        {CTA[language]}
      </PrimaryButton>
    </div>
  );
}
