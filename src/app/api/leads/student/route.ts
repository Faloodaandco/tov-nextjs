import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, postcode } = body;

    if (!name || !phone || !postcode) {
      return NextResponse.json({ error: 'Name, phone, and postcode are required.' }, { status: 400 });
    }

    // Sanitize phone number (basic)
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    const leadDoc = {
      name: name.slice(0, 100),
      phone: cleanPhone.slice(0, 20),
      email: email ? email.slice(0, 100) : null,
      postcode: postcode.toUpperCase().slice(0, 10),
      createdAt: new Date().toISOString(),
      source: 'student_promo_2026',
      offer: '50_off_first_3',
      ordersUsed: 0,
    };

    // Use phone number as document ID for idempotency/upsert
    await adminDb.collection('student_leads').doc(cleanPhone).set(leadDoc, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Student Lead API] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
