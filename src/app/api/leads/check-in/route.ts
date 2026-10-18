import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, campaign, location, tenantId, branch, source, voucherCode: requestedCode } = body || {};

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = requestedCode || `TOV50-${randomSuffix}`;

    // Normalise phone to E.164 (+44...)
    let cleanPhone = phone.trim();
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '+44' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+44' + cleanPhone;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const effectiveBranch = branch || 'all';
    const is50 = voucherCode.startsWith('TOV50') || voucherCode.startsWith('HALF');

    // 1. Record lead
    await adminDb.collection('leads').add({
      name: name.trim(),
      email: (email || '').trim().toLowerCase(),
      phone: cleanPhone,
      campaign: campaign || 'dine_in_30_off',
      tenantId: tenantId || location || 'tov',
      branch: effectiveBranch,
      source: source || 'web_check_in',
      voucherCode,
      createdAt: now.toISOString(),
    });

    // 2. Provision active voucher in Firestore vouchers registry
    await adminDb.collection('vouchers').add({
      code: voucherCode,
      phone: cleanPhone,
      branch: effectiveBranch,
      type: is50 ? 'FIRST_TIME_50' : 'CAMPAIGN',
      discountPercent: is50 ? 50 : 30,
      minOrderPence: 0,
      maxUses: 1,
      usedCount: 0,
      usedOrderIds: [],
      expiresAt,
      createdAt: now.toISOString(),
      source: 'web_check_in',
      status: 'active',
    });

    return NextResponse.json({ success: true, voucherCode });
  } catch (err: any) {
    console.error('[Leads Check-In API] Error saving lead and voucher:', err);
    return NextResponse.json({ error: 'Failed to process lead.' }, { status: 500 });
  }
}
