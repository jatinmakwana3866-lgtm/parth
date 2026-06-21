import { useEffect } from 'react';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import { syncTokenBalance } from './lib/auth';
import { onFirebaseAuthStateChanged, saveOrUpdateUserProfile } from './lib/firebaseAuth';

import { LanguageScreen } from './onboarding/LanguageScreen';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { SignupScreen } from './onboarding/SignupScreen';
import { RoleSelectScreen } from './onboarding/RoleSelectScreen';
import { ProfileSetupScreen } from './onboarding/ProfileSetupScreen';
import { WelcomeGiftScreen } from './onboarding/WelcomeGiftScreen';

import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { ProfileViewScreen } from './screens/ProfileViewScreen';
import { ChatInboxScreen } from './screens/ChatInboxScreen';
import { ChatThreadScreen } from './screens/ChatThreadScreen';
import { TokenWalletScreen } from './screens/TokenWalletScreen';
import { BuyTokensScreen } from './screens/BuyTokensScreen';
import { ReferEarnScreen } from './screens/ReferEarnScreen';
import { MyProfileScreen } from './screens/MyProfileScreen';
import { SEODashboard } from './screens/SEODashboard';
import type { ScreenName } from './types';

const PROTECTED_SCREENS: ScreenName[] = [
  'home', 'discover', 'profileView', 'chat', 'chatThread',
  'tokenWallet', 'buyTokens', 'referEarn', 'myProfile', 'seoDashboard',
];

function App() {
  const screen = useStore(s => s.screen);
  const isAuthenticated = useStore(s => s.auth.isAuthenticated);
  const setAuth = useStore(s => s.setAuth);

  // Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          setAuth({
            isAuthenticated: true,
            authUid: session.user.id,
            accessToken: session.access_token,
          });
          const tokens = await syncTokenBalance(session.user.id);
          useStore.setState(state => ({
            user: { ...state.user, tokens, email: session.user.email || state.user.email },
          }));
        } else {
          // Only clear Supabase auth — Firebase may still be active
          setAuth({ accessToken: null });
        }
      })();
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setAuth({
          isAuthenticated: true,
          authUid: session.user.id,
          accessToken: session.access_token,
        });
        const tokens = await syncTokenBalance(session.user.id);
        useStore.setState(state => ({
          user: { ...state.user, tokens, email: session.user.email || state.user.email },
        }));
      }
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsub = onFirebaseAuthStateChanged(async (user) => {
      if (user) {
        const profile = await saveOrUpdateUserProfile(user);
        useStore.setState(state => ({
          firebaseUser: profile,
          auth: {
            ...state.auth,
            isAuthenticated: true,
            authUid: state.auth.authUid || user.uid,
          },
          user: {
            ...state.user,
            name: state.user.name || profile.displayName,
            email: state.user.email || profile.email,
            photoURL: profile.photoURL,
          },
        }));
      }
    });
    return unsub;
  }, []);

  const effectiveScreen = PROTECTED_SCREENS.includes(screen) && !isAuthenticated
    ? 'welcome' as ScreenName
    : screen;

  const renderScreen = () => {
    switch (effectiveScreen) {
      case 'language': return <LanguageScreen />;
      case 'welcome': return <WelcomeScreen />;
      case 'signup': return <SignupScreen />;
      case 'roleSelect': return <RoleSelectScreen />;
      case 'profileSetup': return <ProfileSetupScreen />;
      case 'welcomeGift': return <WelcomeGiftScreen />;
      case 'home': return <HomeScreen />;
      case 'discover': return <DiscoverScreen />;
      case 'profileView': return <ProfileViewScreen />;
      case 'chat': return <ChatInboxScreen />;
      case 'chatThread': return <ChatThreadScreen />;
      case 'tokenWallet': return <TokenWalletScreen />;
      case 'buyTokens': return <BuyTokensScreen />;
      case 'referEarn': return <ReferEarnScreen />;
      case 'myProfile': return <MyProfileScreen />;
      case 'seoDashboard': return <SEODashboard />;
      default: return <LanguageScreen />;
    }
  };

  return (
    <div style={{ background: '#0A0E1A', minHeight: '100vh' }}>
      {renderScreen()}
    </div>
  );
}

export default App;
