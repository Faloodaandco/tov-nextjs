import { NextRequest, NextResponse } from 'next/server';
import { signAdminJWT } from '@/lib/adminAuth';

/**
 * Server-side admin login for Taste of Village.
 * PINs are ONLY stored server-side — never shipped in client bundle.
 */

interface StaffMember {
  id: string;
  name: string;
  role: 'owner' | 'manager' | 'admin';
  branch: 'hayes' | 'slough' | 'all';
}

const envStaffPin = process.env.STAFF_PIN?.trim();

const STAFF_PINS: Record<string, StaffMember> = {
  '2244': { id: 'owner_aziz', name: 'Aziz / Owner', role: 'owner', branch: 'all' },
  '2580': { id: 'manager_slough', name: 'Store Manager (Slough)', role: 'manager', branch: 'slough' },
  '2233': { id: 'manager_hayes', name: 'Ijaz / Manager (Hayes)', role: 'manager', branch: 'hayes' },
  '7860': { id: 'admin_tov', name: 'Master Admin', role: 'admin', branch: 'all' },
};

// Also register custom env PIN if not already included
if (envStaffPin && !STAFF_PINS[envStaffPin]) {
  STAFF_PINS[envStaffPin] = {
    id: 'staff_env',
    name: 'Authorized Staff',
    role: 'manager',
    branch: 'all',
  };
}

const ALLOWED_ADMIN_EMAILS = [
  'sales@faloodaandco.co.uk',
  'sales@tasteofvillagerestaurants.co.uk',
  'info@tasteofvillagerestaurants.co.uk',
  'admin@tasteofvillagerestaurants.co.uk',
  'aziz@tasteofvillagerestaurants.co.uk',
];

// Server-side rate limiting (per IP, in-memory)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      const mins = Math.ceil((record.lockedUntil - now) / 60000);
      return { allowed: false, message: `Too many attempts. Try again in ${mins} minute(s).` };
    }
    if (record.lockedUntil <= now && record.count >= 5) {
      loginAttempts.delete(ip);
    }
  }

  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count++;
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 10 * 60 * 1000; // 10 minute lockout
  }
  loginAttempts.set(ip, record);
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: rateCheck.message }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { method, pin, idToken } = body;

    // ─── PIN Login ───
    if (method === 'pin') {
      if (!pin || typeof pin !== 'string') {
        return NextResponse.json({ error: 'PIN required' }, { status: 400 });
      }

      const staff = STAFF_PINS[pin.trim()];
      if (!staff) {
        recordFailedAttempt(ip);
        const record = loginAttempts.get(ip);
        const remaining = 5 - (record?.count || 0);
        return NextResponse.json(
          {
            error:
              remaining > 0
                ? `Invalid PIN. ${remaining} attempt(s) remaining.`
                : 'Too many attempts. Account locked for 10 minutes.',
          },
          { status: 401 }
        );
      }

      clearAttempts(ip);

      const token = await signAdminJWT({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        branch: staff.branch,
        method: 'pin',
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          branch: staff.branch,
          method: 'pin',
        },
      });

      res.cookies.set('tov_admin_session', token, {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return res;
    }

    // ─── Google SSO Login (ID token verification) ───
    if (method === 'google') {
      if (!idToken || typeof idToken !== 'string') {
        return NextResponse.json({ error: 'Google ID token required' }, { status: 400 });
      }

      let email = '';
      let name = '';

      // Try verifying through Firebase Admin Auth
      try {
        const { getAuth } = await import('firebase-admin/auth');
        const { adminApp } = await import('@/lib/firebaseAdmin');
        const decodedToken = await getAuth(adminApp).verifyIdToken(idToken);
        email = decodedToken.email || '';
        name = decodedToken.name || email;
      } catch (fbErr) {
        // Fallback: try google-auth-library if configured
        try {
          const { OAuth2Client } = await import('google-auth-library');
          const client = new OAuth2Client();
          const ticket = await client.verifyIdToken({ idToken });
          const payload = ticket.getPayload();
          email = payload?.email || '';
          name = payload?.name || email;
        } catch (gErr) {
          console.error('[Admin Login] Google ID token verification failed:', fbErr, gErr);
          recordFailedAttempt(ip);
          return NextResponse.json({ error: 'Invalid Google identity token' }, { status: 401 });
        }
      }

      const normalizedEmail = email.toLowerCase().trim();
      if (!normalizedEmail) {
        recordFailedAttempt(ip);
        return NextResponse.json({ error: 'Verified Google email not found' }, { status: 401 });
      }

      const isAllowed =
        ALLOWED_ADMIN_EMAILS.includes(normalizedEmail) ||
        normalizedEmail.endsWith('@tasteofvillagerestaurants.co.uk') ||
        normalizedEmail.endsWith('@faloodaandco.co.uk');

      if (!isAllowed) {
        return NextResponse.json(
          { error: `Email ${normalizedEmail} is not authorized for staff access.` },
          { status: 403 }
        );
      }

      clearAttempts(ip);

      const userId = `google_${normalizedEmail.split('@')[0]}`;
      const token = await signAdminJWT({
        id: userId,
        name: name || normalizedEmail,
        role: 'owner',
        branch: 'all',
        method: 'google',
      });

      const res = NextResponse.json({
        success: true,
        user: {
          id: userId,
          name: name || normalizedEmail,
          email: normalizedEmail,
          role: 'owner',
          branch: 'all',
          method: 'google',
        },
      });

      res.cookies.set('tov_admin_session', token, {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return res;
    }

    return NextResponse.json({ error: 'Invalid method: must be "pin" or "google"' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Login] Error:', err);
    return NextResponse.json({ error: 'Login process error' }, { status: 500 });
  }
}
