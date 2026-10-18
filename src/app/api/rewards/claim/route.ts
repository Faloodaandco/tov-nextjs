/**
 * POST /api/rewards/claim
 *
 * Customer claims a loyalty reward by spending points.
 * Returns the reward code and QR redemption URL.
 *
 * Body: { phone: string, rewardId: string }
 */
import { NextResponse } from 'next/server';
import { claimReward, getCustomerRewards, REWARDS_CATALOGUE } from '@/services/RewardService';
import { phoneToDocId } from '@/services/serverCustomerService';
import { adminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, rewardId } = body;

    if (!phone || !rewardId) {
      return NextResponse.json(
        { error: 'phone and rewardId are required' },
        { status: 400 },
      );
    }

    // Validate rewardId
    const reward = REWARDS_CATALOGUE.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: `Invalid rewardId. Valid options: ${REWARDS_CATALOGUE.map(r => r.id).join(', ')}` },
        { status: 400 },
      );
    }

    const result = await claimReward(phone, rewardId);

    return NextResponse.json({
      status: 'claimed',
      code: result.code,
      redeemUrl: result.redeemUrl,
      reward: {
        title: result.reward.rewardTitle,
        description: result.reward.rewardDescription,
        pointsSpent: result.reward.pointsSpent,
        expiresAt: result.reward.expiresAt,
      },
    });
  } catch (err: any) {
    console.error('[Rewards Claim]', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to claim reward' },
      { status: 400 },
    );
  }
}

/**
 * GET /api/rewards/claim?phone=44XXXXXXXXXX
 *
 * Returns a customer's available points, active rewards, and the catalogue.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ error: 'phone query param required' }, { status: 400 });
    }

    // Get customer points
    const docId = phoneToDocId(phone);
    const customerSnap = await adminDb.collection('customers').doc(docId).get();

    if (!customerSnap.exists) {
      return NextResponse.json({
        points: 0,
        catalogue: REWARDS_CATALOGUE,
        activeRewards: [],
      });
    }

    const customer = customerSnap.data()!;
    const points = customer.loyaltyPoints || 0;

    // Get active rewards
    const rewards = await getCustomerRewards(phone);
    const activeRewards = rewards.filter(r => r.status === 'active');

    return NextResponse.json({
      points,
      catalogue: REWARDS_CATALOGUE.map(r => ({
        ...r,
        canClaim: points >= r.pointsCost,
        pointsNeeded: Math.max(0, r.pointsCost - points),
      })),
      activeRewards: activeRewards.map(r => ({
        code: r.code,
        title: r.rewardTitle,
        description: r.rewardDescription,
        redeemUrl: `https://tasteofvillagerestaurants.co.uk/redeem/${r.code}`,
        expiresAt: r.expiresAt,
      })),
    });
  } catch (err: any) {
    console.error('[Rewards Claim GET]', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 },
    );
  }
}
