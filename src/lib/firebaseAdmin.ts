import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be used on the client side.');
}

let adminApp: App;

if (!getApps().length) {
  // ── Modern Authentication (WIF & ADC) ────────────────────────────
  // We no longer use hardcoded Base64 Service Account keys.
  // This relies on Google's standard auth chain:
  // 1. Workload Identity Federation (WIF) via GOOGLE_APPLICATION_CREDENTIALS config in Vercel
  // 2. Application Default Credentials (gcloud auth application-default login) for local dev
  try {
    adminApp = initializeApp({
      projectId: 'taste-of-village-21052',
    });
    console.info('[FirebaseAdmin] Initialized using modern ADC / Workload Identity Federation');
  } catch (error) {
    console.error('[FirebaseAdmin] Failed to initialize:', error);
    throw error;
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb: Firestore = getFirestore(adminApp);
export { adminApp };
