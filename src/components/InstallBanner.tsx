import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed (running as standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Previously dismissed
    if (localStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  };

  if (!prompt || dismissed || installed) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 12,
      right: 12,
      zIndex: 9999,
      background: 'linear-gradient(135deg, #1C2438, #0F1525)',
      border: '1px solid rgba(212,168,83,0.35)',
      borderRadius: 18,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.1)',
      animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #D4A853, #7A5520)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone size={22} color="#0A0E1A" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F5F0', marginBottom: 2 }}>
          Install App
        </div>
        <div style={{ fontSize: '12px', color: '#A8A29E', lineHeight: 1.4 }}>
          Add to your home screen for a native app experience
        </div>
      </div>

      <button
        onClick={handleInstall}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10,
          background: 'linear-gradient(135deg, #D4A853, #7A5520)',
          color: '#0A0E1A', border: 'none', fontSize: '13px',
          fontWeight: 700, cursor: 'pointer', flexShrink: 0,
          fontFamily: 'inherit',
        }}
      >
        <Download size={14} />
        Install
      </button>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6B7280', padding: 4, flexShrink: 0,
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
}
