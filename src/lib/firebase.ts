import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDeOYtrCzbNevi-brpMYZPtGLw0HV7yVG0",
  authDomain: "embroidery-marketplace.firebaseapp.com",
  projectId: "embroidery-marketplace",
  storageBucket: "embroidery-marketplace.firebasestorage.app",
  messagingSenderId: "504046031968",
  appId: "1:504046031968:web:441a97dee05e3d74841f05",
  measurementId: "G-TFDSRRE7S1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('[Firebase] App initialized. Project:', firebaseConfig.projectId);

export const firebaseAuth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
console.log('[Firebase] Auth and Firestore ready');
