import { NextResponse } from 'next/server';

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env var exists
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  checks.envVarExists = b64 ? `yes (${b64.length} chars)` : 'NO';

  // 2. Try base64 decode
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf-8');
      checks.base64Decode = `ok (${decoded.length} chars)`;

      // 3. Try JSON parse
      try {
        const sa = JSON.parse(decoded);
        checks.jsonParse = `ok (project: ${sa.project_id})`;
        checks.hasPrivateKey = sa.private_key ? `yes (${sa.private_key.length} chars)` : 'NO';
        checks.hasClientEmail = sa.client_email ? 'yes' : 'NO';

        // 4. Try cert()
        try {
          const { cert } = await import('firebase-admin/app');
          const cred = cert({
            projectId: sa.project_id,
            clientEmail: sa.client_email,
            privateKey: sa.private_key,
          });
          checks.cert = 'ok';
        } catch (certErr) {
          checks.cert = `FAILED: ${(certErr as Error).message}`;
        }
      } catch (jsonErr) {
        checks.jsonParse = `FAILED: ${(jsonErr as Error).message}`;
      }
    } catch (b64Err) {
      checks.base64Decode = `FAILED: ${(b64Err as Error).message}`;
    }
  }

  // 5. Try importing firebaseAdmin
  try {
    const { adminDb } = await import('@/lib/firebaseAdmin');
    checks.firebaseAdmin = adminDb ? 'ok' : 'null';
  } catch (fbErr) {
    checks.firebaseAdmin = `FAILED: ${(fbErr as Error).message}`;
  }

  return NextResponse.json(checks);
}
