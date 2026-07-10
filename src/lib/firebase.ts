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
let appCheckInitPromise: Promise<void> | null = null;

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

/**
 * Firebase App Check (reCAPTCHA v3) — free bot / abuse layer.
 * Requires VITE_FIREBASE_APPCHECK_SITE_KEY (reCAPTCHA v3 site key from Firebase Console).
 * Local dev: set VITE_FIREBASE_APPCHECK_DEBUG_TOKEN=true or a debug token string.
 */
export async function initFirebaseAppCheck(): Promise<void> {
  if (!app || appCheckInitPromise) {
    return appCheckInitPromise || Promise.resolve();
  }

  appCheckInitPromise = (async () => {
    const siteKey =
      metaEnv.VITE_FIREBASE_APPCHECK_SITE_KEY ||
      metaEnv.VITE_RECAPTCHA_SITE_KEY ||
      '';
    if (!siteKey) {
      if (metaEnv.DEV) {
        console.warn(
          'App Check skipped: set VITE_FIREBASE_APPCHECK_SITE_KEY (reCAPTCHA v3 site key).'
        );
      }
      return;
    }

    try {
      // Debug provider for local / CI without real reCAPTCHA challenges
      if (metaEnv.DEV || metaEnv.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN) {
        const debugToken = metaEnv.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN;
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
          debugToken === 'true' || debugToken === true ? true : debugToken || true;
      }

      const { initializeAppCheck, ReCaptchaV3Provider } = await import(
        'firebase/app-check'
      );
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      });
      if (metaEnv.DEV) {
        console.log('Firebase App Check initialized (reCAPTCHA v3)');
      }
    } catch (e) {
      console.warn('Firebase App Check init failed (non-fatal):', e);
    }
  })();

  return appCheckInitPromise;
}

// Kick off App Check as early as possible (non-blocking)
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  void initFirebaseAppCheck();
}

export { app, db, auth, isFirebaseConfigured };

export const getFirebaseStorage = async () => {
  if (!app) return null;
  // Ensure App Check token is registered before Storage calls when enforcement is on
  await initFirebaseAppCheck();
  if (!storagePromise) {
    storagePromise = import('firebase/storage').then(({ getStorage }) => getStorage(app));
  }
  return storagePromise;
};

export const googleProvider = auth ? new GoogleAuthProvider() : null;

export const ensureAnonymousUser = async () => {
  if (!auth) throw new Error('Firebase Auth yapılandırılmadı.');
  await initFirebaseAppCheck();
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
};

// Admin access always requires a real Firebase provider and ID token.
export const loginWithGoogleAdmin = async () => {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Admin girişi kullanılamıyor.');
  }
  await initFirebaseAppCheck();
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
