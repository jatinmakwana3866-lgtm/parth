import {
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
  AuthError,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseAuth, db, googleProvider } from './firebase';

export interface FirebaseUserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  tokens: number;
  city: string;
  createdAt: unknown;
  updatedAt: unknown;
}

export async function signInWithGoogle(): Promise<void> {
  console.log('[Firebase] Starting Google Sign-In via redirect...');

  try {
    await signInWithRedirect(firebaseAuth, googleProvider);
    // The page will redirect, so this line won't be reached.
    // The result is handled in getRedirectResult after the page reloads.
  } catch (err) {
    const error = err as AuthError;
    console.error('[Firebase] signInWithRedirect failed:', error.code, error.message);

    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Firebase. Add it to the Authorized Domains list in Firebase Console.');
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(error.message || 'Google Sign-In failed. Please try again.');
  }
}

export async function processRedirectResult(): Promise<FirebaseUserProfile | null> {
  console.log('[Firebase] Processing redirect result...');

  try {
    const result = await getRedirectResult(firebaseAuth);

    if (!result) {
      console.log('[Firebase] No redirect result found');
      return null;
    }

    console.log('[Firebase] Redirect sign-in succeeded. User:', result.user.uid);
    const profile = await saveOrUpdateUserProfile(result.user);
    console.log('[Firebase] User profile saved/updated in Firestore:', profile.uid);
    return profile;
  } catch (err) {
    const error = err as AuthError;
    console.error('[Firebase] getRedirectResult failed:', error.code, error.message);

    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Firebase. Add it to the Authorized Domains list in Firebase Console.');
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw new Error(error.message || 'Google Sign-In failed. Please try again.');
  }
}

export async function saveOrUpdateUserProfile(user: User): Promise<FirebaseUserProfile> {
  console.log('[Firebase] Saving user profile for', user.uid);
  const ref = doc(db, 'users', user.uid);

  try {
    const snap = await getDoc(ref);

    const base = {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      updatedAt: serverTimestamp(),
    };

    if (!snap.exists()) {
      console.log('[Firebase] New user — creating profile document');
      const newProfile = {
        ...base,
        role: 'machine_wala',
        tokens: 0,
        city: '',
        createdAt: serverTimestamp(),
      };
      await setDoc(ref, newProfile);
      return { ...newProfile, createdAt: null, updatedAt: null } as FirebaseUserProfile;
    }

    console.log('[Firebase] Existing user — merging profile update');
    await setDoc(ref, base, { merge: true });
    const updated = snap.data() as FirebaseUserProfile;
    return { ...updated, ...base } as FirebaseUserProfile;
  } catch (err) {
    console.error('[Firebase] Firestore profile save failed:', err);
    // Return a minimal profile so sign-in still succeeds even if Firestore write fails
    return {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'machine_wala',
      tokens: 0,
      city: '',
      createdAt: null,
      updatedAt: null,
    };
  }
}

export async function getUserProfile(uid: string): Promise<FirebaseUserProfile | null> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as FirebaseUserProfile;
  } catch (err) {
    console.error('[Firebase] getUserProfile failed:', err);
    return null;
  }
}

export function firebaseSignOut(): Promise<void> {
  console.log('[Firebase] Signing out...');
  return fbSignOut(firebaseAuth);
}

export function onFirebaseAuthStateChanged(
  callback: (user: User | null) => void
): () => void {
  console.log('[Firebase] Registering auth state listener');
  return onAuthStateChanged(firebaseAuth, (user) => {
    console.log('[Firebase] Auth state changed. User:', user ? user.uid : 'null');
    callback(user);
  });
}
