import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { attempts: number; resetTime: number }>();

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
    const correctPin = process.env.STAFF_PIN;

    if (!correctPin) {
      console.error('STAFF_PIN environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (pin === correctPin) {
      rateLimitMap.delete(ip);
      return NextResponse.json({ authenticated: true });
    } else {
      const currentAttempts = rateLimitMap.get(ip)?.attempts || 0;
      rateLimitMap.set(ip, {
        attempts: currentAttempts + 1,
        resetTime: now + windowMs,
      });

      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
