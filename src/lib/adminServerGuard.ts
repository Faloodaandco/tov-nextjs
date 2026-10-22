import { NextRequest } from 'next/server';
import { verifyAdminJWT, AdminPayload } from '@/lib/adminAuth';

const VALID_PINS = ['2244', '2580', '2233', '7860'];

/**
 * Universal server-side admin guard.
 * Accepts:
 * 1. httpOnly cookie `tov_admin_session` (cryptographic JWT)
 * 2. Authorization header `Bearer <JWT>`
 * 3. Legacy Authorization header `Bearer <PIN>`
 */
export async function authenticateAdminRequest(request: NextRequest): Promise<AdminPayload | null> {
  // 1. Check httpOnly Cookie
  const cookieToken = request.cookies.get('tov_admin_session')?.value;
  if (cookieToken) {
    const payload = await verifyAdminJWT(cookieToken);
    if (payload) return payload;
  }

  // 2. Check Authorization Header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawVal = authHeader.split(' ')[1]?.trim();
    if (rawVal) {
      // Is it a JWT?
      if (rawVal.includes('.')) {
        const payload = await verifyAdminJWT(rawVal);
        if (payload) return payload;
      }

      // Legacy plain PIN check
      const envPin = process.env.STAFF_PIN?.trim();
      if ((envPin && rawVal === envPin) || VALID_PINS.includes(rawVal)) {
        return {
          id: 'staff_bearer',
          name: 'Staff Member',
          role: 'manager',
          branch: 'all',
          method: 'pin',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400,
        };
      }
    }
  }

  return null;
}
