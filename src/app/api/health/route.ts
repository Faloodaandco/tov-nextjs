import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { LOCATIONS, isBreakfastPromoTime } from '@/config/shopConfig';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Comprehensive production health check and monitoring endpoint.
 * Suitable for UptimeRobot, BetterStack, Cloudflare Health Checks, Datadog.
 * Checks Firestore latency, Square config, branch operating status, and UK hours.
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // 1. Firebase Firestore Connectivity & Latency Check
  try {
    const dbStart = Date.now();
    await adminDb.collection('settings').limit(1).get();
    const dbLatencyMs = Date.now() - dbStart;
    checks.firestore = {
      status: 'up',
      latencyMs: dbLatencyMs,
    };
  } catch (err: any) {
    checks.firestore = {
      status: 'down',
      error: err?.message || 'Firestore connection failed',
    };
    overallStatus = 'unhealthy';
  }

  // 2. Square Payment Configuration Integrity
  const hasSquareToken = !!process.env.SQUARE_ACCESS_TOKEN;
  const hasHayesWebhook = !!process.env.SQUARE_HAYES_WEBHOOK_SIGNATURE_KEY;
  const hasSloughWebhook = !!process.env.SQUARE_SLOUGH_WEBHOOK_SIGNATURE_KEY;

  checks.square = {
    accessTokenConfigured: hasSquareToken,
    webhooks: {
      hayesConfigured: hasHayesWebhook,
      sloughConfigured: hasSloughWebhook,
    },
    locations: {
      hayesId: 'LW0Z07P1KP8HB',
      sloughId: 'LD40KJ3QHAPGK',
    },
    status: hasSquareToken && (hasHayesWebhook || hasSloughWebhook) ? 'configured' : 'degraded',
  };

  if (checks.square.status !== 'configured') {
    overallStatus = 'degraded';
  }

  // 3. Kitchen & Operating Hours Status (Europe/London timezone)
  let londonTime: Date;
  try {
    londonTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/London' }));
  } catch {
    londonTime = new Date();
  }

  const currentHour = londonTime.getHours();
  const currentDay = londonTime.getDay(); // 0 is Sunday
  const isKitchenOpen = currentHour >= 9 && currentHour < 23;
  const isSundayRoastDay = currentDay === 0 && currentHour >= 12 && currentHour < 17;

  checks.operations = {
    currentTimeUK: londonTime.toISOString(),
    kitchenStatus: isKitchenOpen ? 'open' : 'closed_accepting_preorders',
    hours: '09:00 - 23:00 GMT/BST',
    breakfastPromoActive: isBreakfastPromoTime(),
    sundayRoastActive: isSundayRoastDay,
  };

  // 4. Branch Registry
  checks.branches = {
    hayes: {
      name: LOCATIONS.hayes.name,
      address: LOCATIONS.hayes.address,
      postcode: LOCATIONS.hayes.postcode,
      phone: LOCATIONS.hayes.phone,
      active: true,
    },
    slough: {
      name: LOCATIONS.slough.name,
      address: LOCATIONS.slough.address,
      postcode: LOCATIONS.slough.postcode,
      phone: LOCATIONS.slough.phone,
      active: true,
    },
  };

  const totalDurationMs = Date.now() - startTime;

  const responseBody = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    durationMs: totalDurationMs,
    environment: process.env.NODE_ENV || 'production',
    checks,
  };

  const httpStatus = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(responseBody, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Health-Status': overallStatus,
    },
  });
}
