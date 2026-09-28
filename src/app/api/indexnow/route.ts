/**
 * IndexNow API Route — Instant URL Submission to Bing, Yandex, Naver, Seznam
 *
 * POST /api/indexnow
 * Body: { "urls": ["/hayes/menu", "/slough-delivery"] }  (optional — defaults to all SEO pages)
 *
 * Requires: BING_API_KEY in env
 */
import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.BING_API_KEY;
const HOST = 'www.tasteofvillagerestaurants.co.uk';

// All SEO-critical pages for TOV
const ALL_PAGES = [
  '/',
  '/hayes/menu',
  '/slough/menu',
  '/book',
  '/review',
  '/rewards',
  '/links',
  '/info',
  '/privacy',
  '/track',
  '/franchise',
  // SEO landing pages
  '/hayes-delivery',
  '/hayes-breakfast',
  '/hayes-halal-food',
  '/slough-delivery',
  '/slough-breakfast',
  '/slough-desserts',
  '/slough-halal-food',
  '/slough-street-food',
  '/burnham-takeaway',
  '/langley-sweets',
  '/maidenhead-street-food',
  '/windsor-desserts',
  '/reading-desserts',
  '/uxbridge-taste-of-village',
  '/high-wycombe-taste-of-village',
];

export async function POST(request: NextRequest) {
  if (!INDEXNOW_KEY) {
    return NextResponse.json({ error: 'BING_API_KEY not configured' }, { status: 500 });
  }

  // Simple auth — require staff PIN or Vercel cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const staffPin = process.env.STAFF_PIN;

  const isAuthed =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (staffPin && authHeader === `Bearer ${staffPin}`);

  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const requestedUrls: string[] = body.urls || [];

    // Build full URLs
    const urlList = (requestedUrls.length > 0 ? requestedUrls : ALL_PAGES)
      .map(path => `https://${HOST}${path.startsWith('/') ? path : '/' + path}`);

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    // 200 = accepted, 202 = accepted (later processing)
    if (status === 200 || status === 202) {
      console.info(`[IndexNow] Submitted ${urlList.length} URLs — status ${status}`);
      return NextResponse.json({
        success: true,
        submitted: urlList.length,
        status,
      });
    }

    const text = await response.text();
    console.error(`[IndexNow] Failed — status ${status}: ${text}`);
    return NextResponse.json({ error: `IndexNow returned ${status}`, detail: text }, { status: 502 });
  } catch (err) {
    console.error('[IndexNow] Error:', err);
    return NextResponse.json({ error: 'IndexNow submission failed' }, { status: 500 });
  }
}
