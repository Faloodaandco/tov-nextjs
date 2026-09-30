import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

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
    const snapshot = await adminDb.collection('promos').get();
    const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(promos);
  } catch (error) {
    console.error('Error fetching promos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      name,
      discountPercent,
      discountType,
      fixedAmountPence,
      branches,
      minOrderPence,
      maxRedemptions,
      startDate,
      endDate,
      active
    } = body;

    if (!code || !name || !discountType || !branches || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = adminDb.collection('promos').doc(code);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
    }

    const promoData = {
      code,
      name,
      discountPercent: discountPercent || 0,
      discountType,
      fixedAmountPence: fixedAmountPence || 0,
      branches,
      minOrderPence: minOrderPence || 0,
      maxRedemptions: maxRedemptions || 0,
      currentRedemptions: 0,
      startDate,
      endDate,
      active: active ?? true,
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };

    await docRef.set(promoData);

    return NextResponse.json({ success: true, promo: promoData });
  } catch (error) {
    console.error('Error creating promo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, active, ...rest } = body;

    if (!code) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    const docRef = adminDb.collection('promos').doc(code);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Promo not found' }, { status: 404 });
    }

    await docRef.update({ active, ...rest });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating promo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!verifyPin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Promo code required' }, { status: 400 });
    }

    await adminDb.collection('promos').doc(code).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
