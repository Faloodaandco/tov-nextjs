import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (typeof window !== 'undefined') {
  throw new Error('Firebase Admin SDK cannot be used on the client side.');
}

const TOV_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'taste-of-village-21052';

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

function getFirebaseAdmin(): { app: App; db: Firestore } {
  if (_adminApp && _adminDb) {
    return { app: _adminApp, db: _adminDb };
  }

  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    try {
      _adminDb = getFirestore(_adminApp);
    } catch (e) {
      console.warn('[FirebaseAdmin] Warning initializing Firestore from existing app:', e);
    }
    return { app: _adminApp, db: _adminDb as Firestore };
  }

  // ── Credential Resolution ──────────────────────────────────────────
  // Priority:
  //   1. FIREBASE_SERVICE_ACCOUNT_BASE64 / KEY (Vercel production)
  //   2. GCP_SERVICE_ACCOUNT_KEY (env config)
  //   3. Local service-account.json file
  //   4. Default app ADC
  const rawKey =
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.GCP_SERVICE_ACCOUNT_KEY ||
    '';

  if (rawKey) {
    try {
      let parsed: any;
      if (rawKey.trim().startsWith('{')) {
        parsed = JSON.parse(rawKey.trim());
      } else {
        const decoded = Buffer.from(rawKey.trim(), 'base64').toString('utf-8');
        parsed = JSON.parse(decoded);
      }

      _adminApp = initializeApp({
        credential: cert({
          projectId: parsed.project_id || TOV_PROJECT_ID,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key?.replace(/\\n/g, '\n'),
        }),
        projectId: parsed.project_id || TOV_PROJECT_ID,
      });
      _adminDb = getFirestore(_adminApp);
      return { app: _adminApp, db: _adminDb };
    } catch (parseErr) {
      console.error('[FirebaseAdmin] Failed to parse service account key env var:', parseErr);
    }
  }

  // Try reading local service-account.json file if present
  try {
    const localSaPath = path.resolve(process.cwd(), 'service-account.json');
    if (fs.existsSync(localSaPath)) {
      const saContent = fs.readFileSync(localSaPath, 'utf8');
      const parsed = JSON.parse(saContent);
      _adminApp = initializeApp({
        credential: cert({
          projectId: parsed.project_id || TOV_PROJECT_ID,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key?.replace(/\\n/g, '\n'),
        }),
        projectId: parsed.project_id || TOV_PROJECT_ID,
      });
      _adminDb = getFirestore(_adminApp);
      return { app: _adminApp, db: _adminDb };
    }
  } catch (saFileErr) {
    console.warn('[FirebaseAdmin] Local service-account.json check skipped:', saFileErr);
  }

  _adminApp = initializeApp({
    projectId: TOV_PROJECT_ID,
  });
  try {
    _adminDb = getFirestore(_adminApp);
  } catch (err) {
    console.warn('[FirebaseAdmin] Firestore lazy-init warning:', err);
  }
  return { app: _adminApp, db: _adminDb as Firestore };
}

export const adminApp = new Proxy({} as App, {
  get(_target, prop) {
    const { app } = getFirebaseAdmin();
    const val = (app as any)[prop];
    return typeof val === 'function' ? val.bind(app) : val;
  },
});

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const { db } = getFirebaseAdmin();
    const val = (db as any)[prop];
    return typeof val === 'function' ? val.bind(db) : val;
  },
});
