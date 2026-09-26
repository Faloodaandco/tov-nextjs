import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function verifyPin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const pin = authHeader.split(' ')[1];
  return pin === process.env.STAFF_PIN;
}

export async function GET(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || '7';

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GA4_CLIENT_ID!,
        client_secret: process.env.GA4_CLIENT_SECRET!,
        refresh_token: process.env.GA4_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to fetch GA4 access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const reportResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'sessions' }],
      }),
    });

    if (!reportResponse.ok) {
      throw new Error('Failed to fetch GA4 report');
    }

    const reportData = await reportResponse.json();

    const rows = (reportData.rows || []).map((row: any) => ({
      page: row.dimensionValues[0].value,
      pageviews: parseInt(row.metricValues[0].value, 10),
      users: parseInt(row.metricValues[1].value, 10),
      sessions: parseInt(row.metricValues[2].value, 10),
    }));

    const totals = rows.reduce(
      (acc: any, row: any) => {
        acc.pageviews += row.pageviews;
        acc.users += row.users;
        acc.sessions += row.sessions;
        return acc;
      },
      { pageviews: 0, users: 0, sessions: 0 }
    );

    return NextResponse.json({ rows, totals });
  } catch (error: any) {
    console.error('GA4 API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
