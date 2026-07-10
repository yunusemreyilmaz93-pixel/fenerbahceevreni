import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseInjectedConfig from '../../firebase-applet-config.json';
import { isAdminEmail, isAdminUser } from './envHelper';

const injected = firebaseInjectedConfig as any;
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || (injected ? injected.apiKey : ''),
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || (injected ? injected.authDomain : ''),
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || (injected ? injected.projectId : ''),
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || (injected ? injected.storageBucket : ''),
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || (injected ? injected.messagingSenderId : ''),
  appId: metaEnv.VITE_FIREBASE_APP_ID || (injected ? injected.appId : ''),
  firestoreDatabaseId: (injected ? injected.firestoreDatabaseId : undefined)
};

const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);
let app: any = null;
let db: any = null;
let auth: any = null;
let storagePromise: Promise<any> | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    auth = getAuth(app);
    if (metaEnv.DEV) {
      console.log('Firebase initialized (dev):', firebaseConfig.projectId);
    }
  } catch (error) {
    console.error('Failed to initialize Firebase SDK');
  }
}

export { app, db, auth, isFirebaseConfigured };

export const getFirebaseStorage = async () => {
  if (!app) return null;
  if (!storagePromise) {
    storagePromise = import('firebase/storage').then(({ getStorage }) => getStorage(app));
  }
  return storagePromise;
};

export const googleProvider = auth ? new GoogleAuthProvider() : null;

export const ensureAnonymousUser = async () => {
  if (!auth) throw new Error('Firebase Auth yapılandırılmadı.');
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
};

// Admin access always requires a real Firebase provider and ID token.
export const loginWithGoogleAdmin = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Admin girişi kullanılamıyor.');
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const logoutAdmin = async () => {
  if (auth) await signOut(auth);
};

export const getCurrentAdminUser = () => auth?.currentUser || null;
export const getAdminUser = async () => getCurrentAdminUser();

/** True if current Firebase user has admin claim or allowlisted email. */
export const isAdminUserLoggedIn = async () => {
  const user = getCurrentAdminUser();
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult();
    if (token?.claims?.admin === true) return true;
  } catch {
    /* fall through to email */
  }
  return isAdminEmail(user.email);
};

export const onAuthStateChangedAdmin = (callback: (user: any) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return auth.onAuthStateChanged(async (user: any) => {
    if (!user) {
      callback(null);
      return;
    }
    try {
      const token = await user.getIdTokenResult();
      const adminFlag = token?.claims?.admin === true;
      callback(
        adminFlag || isAdminEmail(user.email)
          ? { ...user, admin: adminFlag }
          : null
      );
    } catch {
      callback(isAdminEmail(user.email) ? user : null);
    }
  });
};

export { isAdminUser };
