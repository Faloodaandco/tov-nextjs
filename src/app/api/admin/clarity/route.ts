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
  const days = Math.min(parseInt(searchParams.get('days') || '3', 10), 3);

  try {
    const clarityResponse = await fetch(`https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=${days}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLARITY_API_TOKEN}`,
        'x-clarity-project-id': process.env.CLARITY_PROJECT_ID!,
      },
    });

    if (!clarityResponse.ok) {
      throw new Error('Failed to fetch Clarity data');
    }

    const data = await clarityResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Clarity API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
