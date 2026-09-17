import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  projectId: 'taste-of-village-21052',
  appId: '1:299893522694:web:1726d5d4dd2337c6ba5e87',
  storageBucket: 'taste-of-village-21052.firebasestorage.app',
  apiKey: 'AIzaSyCCa6aq2PZpJojj0QKJApPJTbk3fWqSnRY',
  authDomain: 'taste-of-village-21052.firebaseapp.com',
  messagingSenderId: '299893522694',
  measurementId: 'G-DLX86F7LBK'
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'development') {
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider('6LfdnK0tAAAAAFAbUvaOlqTSHAX7We72a2dojtjh'),
      isTokenAutoRefreshEnabled: true
    });
  } catch (error) {
    console.error('AppCheck error', error);
  }
}

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

let messagingPromise: Promise<any> | null = null;
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  messagingPromise = (async () => {
    try {
      const messaging = getMessaging(app);
      return messaging;
    } catch (error) {
      console.error('Messaging error', error);
      return null;
    }
  })();
}

export { app, db, auth, googleProvider, storage, messagingPromise };
