import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive');
provider.setCustomParameters({ prompt: 'select_account' });

let cachedAccessToken: string | null = null;
const LOGIN_TIMEOUT_MS = 15000;

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = LOGIN_TIMEOUT_MS): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Google sign-in took too long. Popup may be blocked by this browser.')),
      timeoutMs
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(
    auth,
    (user: User | null) => {
      if (user) {
        // A Firebase session can survive refresh, but the short-lived Google Drive
        // OAuth access token cannot. Do not treat that as a failed login; let the
        // app load and ask for Google sign-in again only when Drive access is needed.
        onAuthSuccess?.(user, cachedAccessToken);
        return;
      }

      cachedAccessToken = null;
      onAuthFailure?.();
    },
    (error) => {
      console.error('Auth state listener failed:', error);
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  );
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    const result = await withTimeout(signInWithPopup(auth, provider));
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    if (!cachedAccessToken) {
      console.warn('Google sign-in succeeded without a Drive access token. Core app login will continue; Drive features may ask the user to sign in again.');
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  cachedAccessToken = null;
  await auth.signOut();
};
