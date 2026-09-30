import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { calculateRFMSegment } from '@/services/RFMService';
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

    // Get unique phones from firestore orders for this branch
    const ordersSnap = await adminDb.collection('orders')
      .where('branch', '==', branch)
      .orderBy('createdAt', 'desc')
      .limit(100) // limit for performance in skeleton
      .get();

    const phones = new Set<string>();
    ordersSnap.forEach(doc => {
      const data = doc.data();
      if (data.customerPhone) {
        phones.add(data.customerPhone);
      }
    });

    const results = [];
    for (const phone of Array.from(phones)) {
      try {
        const rfm = await calculateRFMSegment(phone, branch);
        results.push({ phone, ...rfm });
      } catch (err) {
        console.error(`Failed to calculate RFM for ${phone}:`, err);
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching RFM segments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { branch, segment } = body;

    if (!branch || !segment) {
      return NextResponse.json({ error: 'Missing branch or segment' }, { status: 400 });
    }

    // Skeleton implementation
    let offer = '';
    if (segment === 'VIP') {
      offer = 'Early-access to new menu items!';
    } else if (segment === 'At-Risk') {
      offer = 'We miss you! Here is 20% off your next order.';
    } else if (segment === 'Lapsed') {
      offer = 'Come back and enjoy a free side on us!';
    } else {
      offer = 'Thanks for your interest!';
    }

    console.info(`[RFM Offer] Triggered offer for ${segment} at ${branch}: ${offer}`);

    return NextResponse.json({
      success: true,
      message: `Triggered personalised offer for ${segment} customers.`,
      offer
    });
  } catch (error) {
    console.error('Error triggering RFM offer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
