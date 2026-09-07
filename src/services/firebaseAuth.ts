import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'consent',
  access_type: 'offline'
});

// Flag to indicate ongoing sign-in
let isSigningIn = false;
// In-memory access token cache (NOT stored in localStorage/sessionStorage as mandated)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Need to authenticate with popup to obtain OAuth token
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google OAuth');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // Gracefully handle expected user cancellation / popup closure without throwing errors
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      console.info('Google sign-in popup was closed or cancelled by user.');
      return null;
    }

    // Popup blocked by browser settings or iframe
    if (error?.code === 'auth/popup-blocked') {
      console.warn('Google sign-in popup was blocked by the browser.');
      const blockedErr = new Error('Sign-in popup was blocked by your browser. Please allow popups or open the app in a new tab.');
      (blockedErr as any).code = 'auth/popup-blocked';
      throw blockedErr;
    }

    // Handle unauthorized domain (needs Firebase console registration)
    if (error?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      console.warn(`[Firebase Auth] Domain "${currentHost}" is not in Firebase Authorized Domains for project "whatsapp-service-507413".`);
      const authErr = new Error(`Domain not authorized: "${currentHost}". Please register this domain in Firebase Console -> Authentication -> Settings -> Authorized domains, or continue in Preview Mode.`);
      (authErr as any).code = 'auth/unauthorized-domain';
      (authErr as any).domain = currentHost;
      (authErr as any).projectId = 'whatsapp-service-507413';
      throw authErr;
    }

    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};
