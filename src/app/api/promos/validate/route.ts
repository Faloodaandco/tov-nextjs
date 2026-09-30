import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, branchId, subtotalPence } = body || {};

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code is required.' }, { status: 400 });
    }

    if (!branchId || (branchId !== 'hayes' && branchId !== 'slough')) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Valid branch ID is required.' }, { status: 400 });
    }

    const docRef = adminDb.collection('promos').doc(code.toUpperCase());
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code not found.' });
    }

    const promo = docSnap.data();

    if (!promo?.active) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code is inactive.' });
    }

    const now = new Date();
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);

    if (now < startDate) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code is not yet valid.' });
    }

    if (now > endDate) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code has expired.' });
    }

    if (promo.maxRedemptions > 0 && promo.currentRedemptions >= promo.maxRedemptions) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code redemption limit reached.' });
    }

    if (!promo.branches.includes(branchId)) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: 'Promo code is not valid for this branch.' });
    }

    if (typeof subtotalPence === 'number' && subtotalPence < promo.minOrderPence) {
      return NextResponse.json({ valid: false, discountPercent: 0, reason: `Minimum order amount of £${(promo.minOrderPence / 100).toFixed(2)} required.` });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: promo.discountType === 'PERCENTAGE' ? promo.discountPercent : 0,
      fixedAmountPence: promo.discountType === 'FIXED_AMOUNT' ? promo.fixedAmountPence : 0,
      discountType: promo.discountType,
      reason: 'Promo code applied successfully.'
    });

  } catch (err: unknown) {
    console.error('[Promo Validate] Unexpected error:', err);
    return NextResponse.json(
      { valid: false, discountPercent: 0, reason: 'Server error validating promo. Please try again.' },
      { status: 500 },
    );
  }
}
