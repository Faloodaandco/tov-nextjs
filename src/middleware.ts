import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple rate limiter for sensitive API routes.
 * Uses in-memory map — resets on cold start (acceptable for Vercel serverless).
 * Protects against casual enumeration attacks, not sustained DDoS.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rate-limit sensitive API routes
  if (pathname.startsWith('/api/loyalty')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/loyalty/:path*'],
};
