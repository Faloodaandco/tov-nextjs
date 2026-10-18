/**
 * POST /api/rewards/redeem
 *
 * Staff-side: confirms a reward has been given to the customer.
 * Called from the /redeem/[code] page after staff verification.
 *
 * Body: { code: string, staffId?: string, branch: string }
 */
import { NextResponse } from 'next/server';
import { redeemReward, getRedemption } from '@/services/RewardService';
import { createRewardCollectionOrder } from '@/lib/square';
import type { LocationId } from '@/config/shopConfig';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, staffId, branch } = body;

    if (!code || !branch) {
      return NextResponse.json(
        { error: 'code and branch are required' },
        { status: 400 },
      );
    }

    const result = await redeemReward(
      code,
      staffId || 'staff',
      branch,
    );

    // For free-item rewards (no discountPounds), create a £0 pickup order
    // visible on the KDS so kitchen staff can prepare the item.
    let kdsOrderId: string | null = null;
    if (!result.discountPounds) {
      try {
        const kdsResult = await createRewardCollectionOrder({
          branchId: (result.redeemedAtBranch as LocationId) || 'hayes',
          rewardTitle: result.rewardTitle,
          rewardDescription: result.rewardDescription,
          customerName: result.customerName,
          customerPhone: result.phone,
          rewardCode: result.code,
        });
        kdsOrderId = kdsResult.orderId;
      } catch (kdsErr: any) {
        // Log but don't fail the redemption — reward is already redeemed
        console.error('[Rewards Redeem] KDS order creation failed:', kdsErr.message);
      }
    }

    return NextResponse.json({
      status: 'redeemed',
      kdsOrderId,
      redemption: {
        code: result.code,
        customerName: result.customerName,
        rewardTitle: result.rewardTitle,
        redeemedAt: result.redeemedAt,
        redeemedBy: result.redeemedBy,
        redeemedAtBranch: result.redeemedAtBranch,
      },
    });
  } catch (err: any) {
    console.error('[Rewards Redeem]', err.message);
    const status = err.message.includes('not found') ? 404
                 : err.message.includes('Already') ? 409
                 : err.message.includes('expired') ? 410
                 : 400;
    return NextResponse.json({ error: err.message }, { status });
  }
}

/**
 * GET /api/rewards/redeem?code=RWD-XXXXXX
 *
 * Staff-side: validates a reward code and returns its details.
 * Used by the /redeem/[code] page for initial display.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'code query param required' }, { status: 400 });
    }

    const redemption = await getRedemption(code);

    if (!redemption) {
      return NextResponse.json({ error: 'Reward code not found' }, { status: 404 });
    }

    return NextResponse.json({
      code: redemption.code,
      status: redemption.status,
      customerName: redemption.customerName,
      phone: redemption.phone,
      rewardTitle: redemption.rewardTitle,
      rewardDescription: redemption.rewardDescription,
      pointsSpent: redemption.pointsSpent,
      createdAt: redemption.createdAt,
      expiresAt: redemption.expiresAt,
      discountPounds: redemption.discountPounds || null,
      ...(redemption.status === 'redeemed' ? {
        redeemedAt: redemption.redeemedAt,
        redeemedBy: redemption.redeemedBy,
        redeemedAtBranch: redemption.redeemedAtBranch,
      } : {}),
    });
  } catch (err: any) {
    console.error('[Rewards Redeem GET]', err.message);
    return NextResponse.json({ error: 'Failed to validate reward' }, { status: 500 });
  }
}
