import { NextRequest, NextResponse } from 'next/server';
import { SquareCatalogService } from '@/services/SquareCatalogService';

function verifyPin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const pin = authHeader.split(' ')[1];
  return pin === process.env.STAFF_PIN;
}

export async function POST(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const hayesToken = process.env.SQUARE_HAYES_ACCESS_TOKEN;
    const sloughToken = process.env.SQUARE_SLOUGH_ACCESS_TOKEN;

    if (!hayesToken || !sloughToken) {
      return NextResponse.json({ error: 'Missing Square access tokens' }, { status: 500 });
    }

    const hayesResult = await SquareCatalogService.syncAllRules(hayesToken, 'LW0Z07P1KP8HB');
    const sloughResult = await SquareCatalogService.syncAllRules(sloughToken, 'LD40KJ3QHAPGK');

    return NextResponse.json({
      success: true,
      results: {
        hayes: hayesResult,
        slough: sloughResult,
      },
    });
  } catch (error: any) {
    console.error('Error syncing catalog rules:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
