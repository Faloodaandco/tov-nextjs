import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { shouldTriggerWeatherDiscount } from '@/services/WeatherService';
import { LocationId } from '@/config/shopConfig';

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

  try {
    const { searchParams } = new URL(request.url);
    const branch = (searchParams.get('branch') as LocationId) || 'hayes';

    const result = await shouldTriggerWeatherDiscount(branch);
    return NextResponse.json({ success: true, branch, ...result });
  } catch (error) {
    console.error('Error checking weather conditions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch, discountPercent, reason } = body;

    if (!branch || !discountPercent) {
      return NextResponse.json({ error: 'Missing required fields: branch, discountPercent' }, { status: 400 });
    }

    const code = `WEATHER-${branch.toUpperCase()}-${new Date().getHours()}`;
    const docRef = adminDb.collection('promos').doc(code);
    
    const now = new Date();
    const expiry = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours

    const promoData = {
      code,
      name: `Weather Promo: ${reason || 'Special Weather Discount'}`,
      discountPercent,
      discountType: 'percentage',
      fixedAmountPence: 0,
      branches: [branch],
      minOrderPence: 0,
      maxRedemptions: 0, // unlimited
      currentRedemptions: 0,
      startDate: now.toISOString(),
      endDate: expiry.toISOString(),
      active: true,
      createdBy: 'System/Weather',
      createdAt: now.toISOString()
    };

    await docRef.set(promoData);

    console.info(`[Weather Promo] Created promo ${code} for ${branch} valid until ${expiry.toISOString()}`);

    return NextResponse.json({ success: true, promo: promoData });
  } catch (error) {
    console.error('Error triggering weather promo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
