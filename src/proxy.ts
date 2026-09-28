import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple rate limiter for sensitive API routes.
 * Uses in-memory map — resets on cold start (acceptable for Vercel serverless).
 * Protects against casual enumeration attacks, not sustained DDoS.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 60_000);

function isRateLimited(ip: string, maxRequests: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';

  let maxRequests = 0;

  const host = req.headers.get('host') || '';
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/checkout')) {
    maxRequests = 5;
  } else if (pathname.startsWith('/api/delivery')) {
    maxRequests = 20;
  } else if (pathname.startsWith('/api/loyalty')) {
    maxRequests = 10;
  }

  if (maxRequests > 0) {
    if (isRateLimited(ip, maxRequests)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/loyalty/:path*',
    '/api/checkout/:path*',
    '/api/delivery/:path*',
    '/api/webhooks/:path*'
  ],
};

