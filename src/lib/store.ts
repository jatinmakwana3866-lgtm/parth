import { create } from 'zustand';
import type { Language, ScreenName, FormData, UserProfile, TokenPackage, Transaction } from '../types';
import { MOCK_USERS } from '../data/mockUsers';
import { getDeviceId } from './deviceFingerprint';
import { validateDeviceAndClaim, unlockContact, syncTokenBalance, fetchTransactions, signIn, signOut } from './auth';
import { signInWithGoogle, firebaseSignOut } from './firebaseAuth';
import type { FirebaseUserProfile } from './firebaseAuth';

interface Message {
  id: number;
  from: 'me' | 'them';
  text: string;
  time: string;
}

interface AuthState {
  isAuthenticated: boolean;
  authUid: string | null;
  accessToken: string | null;
  emailVerified: boolean;
  suspendMessage: string | null;
  tokenClaimDenied: boolean;
  tokenClaimReason: string | null;
}

interface State {
  screen: ScreenName;
  language: Language;
  selectedRole: string | null;
  formData: FormData;
  showPassword: boolean;
  passwordErrors: string[];
  user: { name: string; email: string; role: string; tokens: number; city: string; verified: boolean; photoURL: string };
  firebaseUser: FirebaseUserProfile | null;
  auth: AuthState;
  userList: UserProfile[];
  transactions: Transaction[];
  profileView: UserProfile | null;
  chatUser: UserProfile | null;
  activeChatId: string | null;
  activeChatOtherUid: string | null;
  activeChatOtherName: string | null;
  activeChatOtherPhoto: string | null;
  messages: Message[];
  unlockModal: UserProfile | null;
  buySuccessPkg: TokenPackage | null;
  unlockSuccess: boolean;
  unlockLoading: boolean;
  copied: boolean;
  loading: boolean;
  tokenClaimDenied: boolean;
  tokenClaimReason: string | null;
  emailVerificationSent: boolean;
  resendCooldown: number;

  setScreen: (s: ScreenName) => void;
  setLanguage: (l: Language) => void;
  setSelectedRole: (r: string) => void;
  updateForm: (field: keyof FormData, value: string) => void;
  togglePassword: () => void;
  setPasswordErrors: (errors: string[]) => void;
  completeOnboarding: () => Promise<void>;
  openUnlockModal: (u: UserProfile) => void;
  closeUnlockModal: () => void;
  confirmUnlock: () => Promise<void>;
  buyPackage: (pkg: TokenPackage) => void;
  sendMessage: (text: string) => void;
  setCopySuccess: () => void;
  setAuth: (auth: Partial<AuthState>) => void;
  syncTokensFromServer: () => Promise<void>;
  handleSignIn: (email: string, password: string) => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  setEmailVerificationSent: (v: boolean) => void;
  startResendCooldown: () => void;
  resetAll: () => void;
}

const initialAuth: AuthState = {
  isAuthenticated: false,
  authUid: null,
  accessToken: null,
  emailVerified: true,
  suspendMessage: null,
  tokenClaimDenied: false,
  tokenClaimReason: null,
};

const initialState = {
  screen: 'language' as ScreenName,
  language: 'en' as Language,
  selectedRole: null as string | null,
  formData: { name: '', email: '', password: '', businessName: '', city: '' } as FormData,
  showPassword: false,
  passwordErrors: [] as string[],
  user: { name: '', email: '', role: 'machine_wala', tokens: 0, city: 'Surat', verified: false, photoURL: '' },
  firebaseUser: null as FirebaseUserProfile | null,
  auth: { ...initialAuth },
  userList: MOCK_USERS,
  transactions: [] as Transaction[],
  profileView: null as UserProfile | null,
  chatUser: null as UserProfile | null,
  activeChatId: null as string | null,
  activeChatOtherUid: null as string | null,
  activeChatOtherName: null as string | null,
  activeChatOtherPhoto: null as string | null,
  messages: [
    { id: 1, from: 'them' as const, text: 'Namaste! Embroidery ka kaam karte ho?', time: '10:23 AM' },
    { id: 2, from: 'me' as const, text: 'Haan! 15 machines hain. Kya kaam hai?', time: '10:24 AM' },
    { id: 3, from: 'them' as const, text: 'Zari work on 500 pcs. Rate kya hoga?', time: '10:25 AM' },
    { id: 4, from: 'me' as const, text: '12 rupees per piece. Sample pehle.', time: '10:25 AM' },
    { id: 5, from: 'them' as const, text: 'Kal milte hain?', time: '10:26 AM' },
  ],
  unlockModal: null as UserProfile | null,
  buySuccessPkg: null as TokenPackage | null,
  unlockSuccess: false,
  unlockLoading: false,
  copied: false,
  loading: false,
  tokenClaimDenied: false,
  tokenClaimReason: null as string | null,
  emailVerificationSent: false,
  resendCooldown: 0,
};

export const useStore = create<State>((set, get) => ({
  ...initialState,

  setScreen: (s) => set({ screen: s }),
  setLanguage: (l) => set({ language: l }),
  setSelectedRole: (r) => set({ selectedRole: r }),
  updateForm: (field, value) => set((state) => ({ formData: { ...state.formData, [field]: value } })),
  togglePassword: () => set((state) => ({ showPassword: !state.showPassword })),
  setPasswordErrors: (errors) => set({ passwordErrors: errors }),

  setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),

  completeOnboarding: async () => {
    set({ loading: true });
    const { formData, selectedRole, auth } = get();

    try {
      const deviceId = getDeviceId();
      const uid = auth.authUid;
      const accessToken = auth.accessToken;
      const email = formData.email;

      if (uid && accessToken) {
        const result = await validateDeviceAndClaim(deviceId, email, uid, accessToken);

        if (result.granted) {
          set({
            screen: 'home',
            user: {
              ...get().user,
              name: formData.name || 'User',
              email: formData.email,
              role: selectedRole || 'machine_wala',
              tokens: result.tokens || 1,
            },
            auth: { ...auth, isAuthenticated: true },
            transactions: [{ id: Date.now(), type: 'gift', text: 'Welcome gift', delta: '+1', time: 'Today' }],
            tokenClaimDenied: false,
            loading: false,
          });
        } else {
          set({
            screen: 'home',
            user: {
              ...get().user,
              name: formData.name || 'User',
              email: formData.email,
              role: selectedRole || 'machine_wala',
              tokens: 0,
            },
            auth: { ...auth, isAuthenticated: true },
            tokenClaimDenied: true,
            tokenClaimReason: result.reason || 'already_claimed',
            loading: false,
          });
        }
      } else {
        // Fallback: no Supabase auth — treat as guest/demo mode with authenticated flag
        set({
          screen: 'home',
          user: {
            ...get().user,
            name: formData.name || 'User',
            email: formData.email,
            role: selectedRole || 'machine_wala',
            tokens: 1,
          },
          auth: { ...auth, isAuthenticated: true },
          transactions: [{ id: Date.now(), type: 'gift', text: 'Welcome gift', delta: '+1', time: 'Today' }],
          loading: false,
        });
      }
    } catch {
      // Network error fallback — still let the user in
      set({
        screen: 'home',
        user: {
          ...get().user,
          name: formData.name || 'User',
          email: formData.email,
          role: selectedRole || 'machine_wala',
          tokens: 0,
        },
        auth: { ...get().auth, isAuthenticated: true },
        loading: false,
      });
    }
  },

  openUnlockModal: (u) => set({ unlockModal: u }),
  closeUnlockModal: () => set({ unlockModal: null }),

  confirmUnlock: async () => {
    const { unlockModal, user, auth, userList } = get();
    if (!unlockModal) return;

    const cost = unlockModal.role === 'vyapari' ? 10 : 1;

    if (auth.accessToken && auth.authUid) {
      set({ unlockLoading: true });
      try {
        const targetUserId = String(unlockModal.id);
        const result = await unlockContact(targetUserId, unlockModal.role, auth.accessToken);

        if (result.success && result.newBalance !== undefined) {
          const newList = userList.map(u => u.id === unlockModal.id ? { ...u, unlocked: true } : u);
          set({
            user: { ...user, tokens: result.newBalance },
            userList: newList,
            unlockModal: null,
            unlockSuccess: true,
            unlockLoading: false,
            profileView: newList.find(u => u.id === unlockModal.id) || null,
            transactions: [
              { id: Date.now(), type: 'spend', text: `Unlocked ${unlockModal.name}`, delta: `-${cost}`, time: 'Just now' },
              ...get().transactions,
            ],
          });
          setTimeout(() => set({ unlockSuccess: false }), 2500);
        } else {
          // Insufficient tokens or error — redirect to buy
          set({ unlockModal: null, unlockLoading: false, screen: 'buyTokens' });
        }
      } catch {
        set({ unlockModal: null, unlockLoading: false, screen: 'buyTokens' });
      }
    } else {
      // No auth — client-side fallback
      if (user.tokens >= cost) {
        const newList = userList.map(u => u.id === unlockModal.id ? { ...u, unlocked: true } : u);
        const newTx: Transaction = {
          id: Date.now(),
          type: 'spend',
          text: `Unlocked ${unlockModal.name}`,
          delta: `-${cost}`,
          time: 'Just now',
        };
        set({
          user: { ...user, tokens: user.tokens - cost },
          userList: newList,
          transactions: [newTx, ...get().transactions],
          unlockModal: null,
          unlockSuccess: true,
          profileView: newList.find(u => u.id === unlockModal.id) || null,
        });
        setTimeout(() => set({ unlockSuccess: false }), 2500);
      } else {
        set({ screen: 'buyTokens', unlockModal: null });
      }
    }
  },

  buyPackage: (pkg) => {
    const { user, transactions } = get();
    const newTx: Transaction = {
      id: Date.now(),
      type: 'purchase',
      text: `Bought ${pkg.name} pack`,
      delta: `+${pkg.tokens}`,
      time: 'Just now',
    };
    set({
      user: { ...user, tokens: user.tokens + pkg.tokens },
      transactions: [newTx, ...transactions],
      buySuccessPkg: pkg,
    });
    setTimeout(() => set({ buySuccessPkg: null, screen: 'tokenWallet' }), 2000);
  },

  sendMessage: (text) => {
    const { messages } = get();
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    set({
      messages: [...messages, { id: Date.now(), from: 'me', text, time }],
    });
  },

  setCopySuccess: () => {
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2000);
  },

  syncTokensFromServer: async () => {
    const { auth } = get();
    if (!auth.authUid) return;
    const tokens = await syncTokenBalance(auth.authUid);
    if (tokens >= 0) {
      set((state) => ({ user: { ...state.user, tokens } }));
    }
  },

  refreshTransactions: async () => {
    const { auth } = get();
    if (!auth.authUid) return;
    const serverTxs = await fetchTransactions(auth.authUid);
    if (serverTxs.length > 0) {
      const mapped: Transaction[] = serverTxs.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        text: tx.text,
        delta: tx.delta,
        time: new Date(tx.created_at).toLocaleDateString(),
      }));
      set({ transactions: mapped });
    }
  },

  handleSignIn: async (email: string, password: string) => {
    set({ loading: true, auth: { ...get().auth, suspendMessage: null } });
    try {
      const result = await signIn(email, password);
      const session = result.data.session;
      if (session) {
        set({
          auth: {
            ...get().auth,
            isAuthenticated: true,
            authUid: session.user.id,
            accessToken: session.access_token,
          },
        });

        // Sync tokens from server
        const tokens = await syncTokenBalance(session.user.id);
        set((state) => ({ user: { ...state.user, tokens, email } }));

        // Load user profile from server
        if (result.deviceCheck?.user) {
          const du = result.deviceCheck.user;
          set((state) => ({
            user: {
              ...state.user,
              name: du.name || state.user.name,
              email: du.email || email,
              role: du.role || state.user.role,
              city: du.city || state.user.city,
              verified: du.verified ?? state.user.verified,
              tokens: du.tokens ?? state.user.tokens,
            },
          }));
        }

        set({ screen: 'home', loading: false });
      }
    } catch (e) {
      set({
        loading: false,
        auth: { ...get().auth, suspendMessage: (e as Error).message },
      });
    }
  },

  handleGoogleSignIn: async () => {
    console.log('[Store] handleGoogleSignIn called — initiating redirect');
    set({ loading: true, auth: { ...get().auth, suspendMessage: null } });
    try {
      // signInWithGoogle now uses redirect — the page will navigate away
      await signInWithGoogle();
      // Code after this won't run — the page is redirecting
    } catch (e) {
      console.error('[Store] handleGoogleSignIn error:', e);
      set({
        loading: false,
        auth: { ...get().auth, suspendMessage: (e as Error).message },
      });
    }
  },

  handleSignOut: async () => {
    try {
      await signOut();
    } catch {}
    try {
      await firebaseSignOut();
    } catch {}
    const keep = { ...initialState, screen: 'language' as ScreenName };
    set(keep);
  },

  setEmailVerificationSent: (v) => set({ emailVerificationSent: v }),

  startResendCooldown: () => {
    set({ resendCooldown: 60 });
    const interval = setInterval(() => {
      const cd = get().resendCooldown - 1;
      if (cd <= 0) {
        clearInterval(interval);
        set({ resendCooldown: 0 });
      } else {
        set({ resendCooldown: cd });
      }
    }, 1000);
  },

  resetAll: () => set({ ...initialState, screen: 'language' as ScreenName }),
}));
