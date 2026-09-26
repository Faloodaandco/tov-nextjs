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
  const days = parseInt(searchParams.get('days') || '30', 10);

  try {
    const bingResponse = await fetch(
      `https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?apikey=${process.env.BING_API_KEY}&siteUrl=https://www.tasteofvillagerestaurants.co.uk`
    );

    if (!bingResponse.ok) {
      throw new Error('Failed to fetch Bing data');
    }

    const data = await bingResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Bing API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
