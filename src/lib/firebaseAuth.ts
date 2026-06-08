import {
  signInWithPopup,
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

export async function signInWithGoogle(): Promise<FirebaseUserProfile> {
  console.log('[Firebase] Starting Google Sign-In with popup...');

  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    console.log('[Firebase] Popup sign-in succeeded. User:', result.user.uid, result.user.email);

    const profile = await saveOrUpdateUserProfile(result.user);
    console.log('[Firebase] User profile saved/updated in Firestore:', profile.uid);
    return profile;
  } catch (err) {
    const error = err as AuthError;
    console.error('[Firebase] signInWithPopup failed:', error.code, error.message);

    // Provide a user-readable message for common error codes
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by the browser. Please allow popups for this site and try again.');
    }
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completing. Please try again.');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Another sign-in popup is already open. Please close it and try again.');
    }
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized in Firebase. Add it to the Authorized Domains list in Firebase Console.');
    }
    // Re-throw with the original message for unexpected errors
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
