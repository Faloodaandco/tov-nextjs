import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be used on the client side.');
}

let adminApp: App;

if (!getApps().length) {
  // ── Credential Resolution ──────────────────────────────────────────
  // Priority:
  //   1. FIREBASE_SERVICE_ACCOUNT_BASE64 (Vercel production)
  //   2. GOOGLE_APPLICATION_CREDENTIALS file path (local dev / GCE)
  //   3. ADC fallback (gcloud auth application-default login)
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (base64Key) {
    // Vercel: decode base64-encoded service account JSON
    try {
      const serviceAccount = JSON.parse(
        Buffer.from(base64Key, 'base64').toString('utf-8')
      );
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id || 'taste-of-village-21052',
      });
    } catch (parseErr) {
      console.error('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', parseErr);
      // Fall through to ADC
      adminApp = initializeApp({
        projectId: 'taste-of-village-21052',
      });
    }
  } else {
    // Local dev: relies on GOOGLE_APPLICATION_CREDENTIALS or gcloud ADC
    adminApp = initializeApp({
      projectId: 'taste-of-village-21052',
    });
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb: Firestore = getFirestore(adminApp);
export { adminApp };
