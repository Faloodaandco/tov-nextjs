import { NextRequest, NextResponse } from 'next/server';
import { validateVoucher } from '@/services/VoucherService';

/**
 * POST /api/vouchers/validate
 *
 * Server-side voucher validation endpoint.
 * Called by the client before displaying discount amounts — ensures
 * the client never calculates discounts from untrusted code prefixes.
 *
 * Request body:
 *   { code: string, phone: string, branchId: string, subtotalPence: number }
 *
 * Response:
 *   { valid: boolean, discountPercent: number, reason: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, phone, branchId, subtotalPence } = body || {};

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, discountPercent: 0, reason: 'Voucher code is required.' },
        { status: 400 },
      );
    }

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { valid: false, discountPercent: 0, reason: 'Phone number is required to validate voucher ownership.' },
        { status: 400 },
      );
    }

    if (!branchId || (branchId !== 'hayes' && branchId !== 'slough')) {
      return NextResponse.json(
        { valid: false, discountPercent: 0, reason: 'Valid branch ID is required.' },
        { status: 400 },
      );
    }

    // Normalise UK phone to E.164 format for Firestore lookup
    let normalisedPhone = phone.trim();
    if (normalisedPhone.startsWith('0')) {
      normalisedPhone = '+44' + normalisedPhone.slice(1);
    }
    if (!normalisedPhone.startsWith('+')) {
      normalisedPhone = '+44' + normalisedPhone;
    }

    const result = await validateVoucher(
      code,
      normalisedPhone,
      branchId,
      typeof subtotalPence === 'number' ? subtotalPence : 0,
    );

    return NextResponse.json({
      valid: result.valid,
      discountPercent: result.discountPercent,
      reason: result.reason,
    });
  } catch (err: unknown) {
    console.error('[Voucher Validate] Unexpected error:', err);
    return NextResponse.json(
      { valid: false, discountPercent: 0, reason: 'Server error validating voucher. Please try again.' },
      { status: 500 },
    );
  }
}
