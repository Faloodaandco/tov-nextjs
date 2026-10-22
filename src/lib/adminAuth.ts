/**
 * Admin authentication utilities for Taste of Village.
 * HMAC-SHA256 JWT signing/verification using native Web Crypto API.
 * Zero external dependencies. Works in Edge Runtime + Node.js.
 */

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY ||
  process.env.SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY ||
  'tov-secure-admin-secret-2026';

const JWT_EXPIRY_SECONDS = 86400; // 24 hours

export interface AdminPayload {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'admin';
  branch?: 'hayes' | 'slough' | 'all';
  method: 'pin' | 'google';
  iat: number;
  exp: number;
}

// ─── Base64url helpers ───

function base64urlEncode(data: Uint8Array): string {
  let str = '';
  for (const byte of data) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

// ─── HMAC-SHA256 ───

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    textToBytes(JWT_SECRET).buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmacSign(data: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, textToBytes(data).buffer as ArrayBuffer);
  return base64urlEncode(new Uint8Array(sig));
}

async function hmacVerify(data: string, signature: string): Promise<boolean> {
  const key = await getKey();
  const sigBytes = base64urlDecode(signature);
  return crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, textToBytes(data).buffer as ArrayBuffer);
}

// ─── JWT Sign / Verify ───

export async function signAdminJWT(payload: Omit<AdminPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRY_SECONDS,
  };

  const header = base64urlEncode(textToBytes(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const body = base64urlEncode(textToBytes(JSON.stringify(fullPayload)));
  const signature = await hmacSign(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export async function verifyAdminJWT(token: string): Promise<AdminPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const valid = await hmacVerify(`${header}.${body}`, signature);
    if (!valid) return null;

    const payload: AdminPayload = JSON.parse(new TextDecoder().decode(base64urlDecode(body)));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
}
