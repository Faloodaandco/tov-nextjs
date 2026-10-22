import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signAdminJWT } from '@/lib/adminAuth';

const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

const VALID_PINS: Record<string, { id: string; name: string; role: 'owner' | 'manager' | 'admin' }> = {
  '2244': { id: 'owner_aziz', name: 'Aziz / Owner', role: 'owner' },
  '2580': { id: 'manager_slough', name: 'Store Manager (Slough)', role: 'manager' },
  '2233': { id: 'manager_hayes', name: 'Ijaz / Manager (Hayes)', role: 'manager' },
  '7860': { id: 'admin_tov', name: 'Master Admin', role: 'admin' },
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'unknown-ip';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const rateLimitInfo = rateLimitMap.get(ip);
  if (rateLimitInfo) {
    if (now > rateLimitInfo.resetTime) {
      rateLimitMap.delete(ip);
    } else if (rateLimitInfo.attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Try again in 15 minutes.' },
        { status: 429 }
      );
    }
  }

  try {
    const { pin } = await request.json();
    const correctEnvPin = process.env.STAFF_PIN?.trim();

    const isMatch = (correctEnvPin && pin === correctEnvPin) || !!VALID_PINS[pin];

    if (isMatch) {
      rateLimitMap.delete(ip);
      const staff = VALID_PINS[pin] || { id: 'staff_env', name: 'Staff Member', role: 'manager' as const };
      const token = await signAdminJWT({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        branch: 'all',
        method: 'pin',
      });

      const response = NextResponse.json({ authenticated: true, token, user: staff });
      response.cookies.set('tov_admin_session', token, {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    } else {
      const currentAttempts = rateLimitMap.get(ip)?.attempts || 0;
      rateLimitMap.set(ip, {
        attempts: currentAttempts + 1,
        resetTime: now + windowMs,
      });

      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
