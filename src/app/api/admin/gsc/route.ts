/**
 * Google Search Console API Route
 *
 * GET /api/admin/gsc?days=30
 *
 * Returns top search queries with impressions, clicks, CTR, and average position.
 * Auth: Service account via GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY env vars.
 * The service account email must be added as a user in Google Search Console.
 */
import { NextRequest, NextResponse } from 'next/server';

const GSC_CLIENT_EMAIL = process.env.GSC_CLIENT_EMAIL;
const GSC_PRIVATE_KEY = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GSC_SITE_URL = process.env.GSC_SITE_URL || 'https://www.tasteofvillagerestaurants.co.uk/';

function verifyAuth(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  return auth.slice(7) === process.env.STAFF_PIN;
}

/**
 * Create a JWT and exchange it for a Google access token
 */
async function getAccessToken(): Promise<string> {
  if (!GSC_CLIENT_EMAIL || !GSC_PRIVATE_KEY) {
    throw new Error('GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: GSC_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Base64url encode
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const unsignedToken = `${b64url(header)}.${b64url(payload)}`;

  // Sign with RSA-SHA256
  const { createSign } = await import('crypto');
  const sign = createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(GSC_PRIVATE_KEY, 'base64url');

  const jwt = `${unsignedToken}.${signature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = await tokenRes.json();
  if (data.error) {
    throw new Error(`Token exchange failed: ${data.error_description || data.error}`);
  }
  return data.access_token;
}

export async function GET(request: NextRequest) {
  if (!verifyAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = Math.min(
    parseInt(request.nextUrl.searchParams.get('days') || '30', 10),
    365
  );

  try {
    const accessToken = await getAccessToken();

    // Calculate date range
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 3); // GSC has ~3 day data lag
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const res = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE_URL)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 50,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error(`[GSC] API error ${res.status}: ${text}`);
      return NextResponse.json(
        { error: `GSC API returned ${res.status}`, detail: text },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Transform rows into a clean format
    const rows = (data.rows || []).map(
      (row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: Math.round(row.ctr * 1000) / 10, // percentage with 1 decimal
        position: Math.round(row.position * 10) / 10,
      })
    );

    // Totals
    const totals = rows.reduce(
      (acc: { clicks: number; impressions: number }, r: { clicks: number; impressions: number }) => ({
        clicks: acc.clicks + r.clicks,
        impressions: acc.impressions + r.impressions,
      }),
      { clicks: 0, impressions: 0 }
    );

    return NextResponse.json({
      rows,
      totals: {
        ...totals,
        ctr: totals.impressions > 0
          ? Math.round((totals.clicks / totals.impressions) * 1000) / 10
          : 0,
      },
      dateRange: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
    });
  } catch (err) {
    console.error('[GSC] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'GSC query failed' },
      { status: 500 }
    );
  }
}
