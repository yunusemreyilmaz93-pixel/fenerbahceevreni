import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseInjectedConfig from '../../firebase-applet-config.json';
import { isAdminEmail } from './envHelper';

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
let storage: any = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase successfully initialized with live dynamic configuration:", firebaseConfig.projectId);
  } catch (error) {
    console.error("Failed to initialize Live Firebase SDK:", error);
  }
}

export { app, db, auth, storage, isFirebaseConfigured };
export const googleProvider = auth ? new GoogleAuthProvider() : null;

export const ensureAnonymousUser = async () => {
  if (!auth) throw new Error('Firebase Auth yapılandırılmadı.');
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
};

// Graceful Auth Helper wrapping signInWithPopup
export const loginWithGoogleAdmin = async () => {
  if (auth && googleProvider) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error("Firebase Login Error:", err);
      throw err;
    }
  } else {
    // Return mock admin user
    const mockUser = {
      uid: "mock-admin-uid-123",
      email: "yunusemreyilmaz93@gmail.com",
      displayName: "Yunus Emre YÄ±lmaz (YÃ¶netici)",
      photoURL: ""
    };
    localStorage.setItem("mock_admin_user", JSON.stringify(mockUser));
    return mockUser;
  }
};

export const logoutAdmin = async () => {
  if (auth) {
    await signOut(auth);
  } else {
    localStorage.removeItem("mock_admin_user");
  }
};

export const getCurrentAdminUser = () => {
  if (auth && auth.currentUser) {
    return auth.currentUser;
  }
  const saved = localStorage.getItem("mock_admin_user");
  return saved ? JSON.parse(saved) : null;
};

export const getAdminUser = async () => {
  return getCurrentAdminUser();
};

export const isAdminUserLoggedIn = async () => {
  return !!getCurrentAdminUser();
};

export const onAuthStateChangedAdmin = (callback: (user: any) => void) => {
  if (auth) {
    return auth.onAuthStateChanged((user: any) => {
      if (user && isAdminEmail(user.email)) {
        callback(user);
      } else {
        callback(null);
      }
    });
  } else {
    const handleMockCheck = () => {
      const user = getCurrentAdminUser();
      callback(user);
    };
    const interval = setInterval(handleMockCheck, 1000);
    handleMockCheck(); // Immediate check
    return () => clearInterval(interval);
  }
};


