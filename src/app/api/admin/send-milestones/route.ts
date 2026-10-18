/**
 * POST /api/admin/send-milestones
 *
 * Sends loyalty milestone nudges to customers who have unlocked
 * rewards but haven't claimed them yet. Protected by CRON_SECRET.
 *
 * Throttle: max 15 messages per invocation (WABA marketing cost control).
 * Dedup:    tracks sent milestones in customer doc field `milestone_notifications_sent`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWhatsAppMessage } from '@/lib/waba';
import { REWARDS_CATALOGUE } from '@/services/RewardService';
import { calculateLoyaltyTier, TIER_NAMES } from '@/services/serverCustomerService';

const MAX_SENDS_PER_RUN = 15;
const HAYES_PHONE_ID = '1309829288888481';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const details: string[] = [];
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // 1. Fetch all customers
    const customersSnap = await adminDb.collection('customers').get();
    details.push(`Total customers: ${customersSnap.size}`);

    // 2. Fetch all active reward_redemptions (batch lookup)
    const activeRedemptionsSnap = await adminDb
      .collection('reward_redemptions')
      .where('status', '==', 'active')
      .get();

    // Build a set of "phone:rewardId" for quick lookup
    const activeRedemptionKeys = new Set<string>();
    for (const doc of activeRedemptionsSnap.docs) {
      const data = doc.data();
      if (data.phone && data.rewardId) {
        activeRedemptionKeys.add(`${data.phone}:${data.rewardId}`);
      }
    }
    details.push(`Active redemptions found: ${activeRedemptionKeys.size}`);

    // Sort catalogue by points descending so we nudge the highest unlocked reward
    const sortedRewards = [...REWARDS_CATALOGUE].sort(
      (a, b) => b.pointsCost - a.pointsCost
    );

    for (const customerDoc of customersSnap.docs) {
      if (sent >= MAX_SENDS_PER_RUN) {
        details.push(`Throttle limit reached (${MAX_SENDS_PER_RUN}). Stopping.`);
        break;
      }

      const customer = customerDoc.data();
      const phone = customerDoc.id; // doc ID is 44XXXXXXXXXX
      const points = customer.loyaltyPoints || 0;

      // Already-sent milestones for this customer
      const alreadySent: string[] = customer.milestone_notifications_sent || [];

      // Find the best (highest) reward they've unlocked but haven't claimed or been notified about
      let bestUnclaimedReward = null;

      for (const reward of sortedRewards) {
        if (points < reward.pointsCost) continue;

        // Already has an active redemption for this reward → skip
        if (activeRedemptionKeys.has(`${phone}:${reward.id}`)) continue;

        // Already notified about this exact milestone → skip
        const milestoneKey = `${reward.id}:${reward.pointsCost}`;
        if (alreadySent.includes(milestoneKey)) continue;

        bestUnclaimedReward = reward;
        break; // Take the highest eligible one
      }

      if (!bestUnclaimedReward) {
        skipped++;
        continue;
      }

      // 3. Build and send the WhatsApp nudge
      const tier = calculateLoyaltyTier(points);
      const tierName = TIER_NAMES[tier] || tier;
      const milestoneKey = `${bestUnclaimedReward.id}:${bestUnclaimedReward.pointsCost}`;

      const messageBody = [
        `🎉 You've unlocked a reward!`,
        ``,
        `With ${points} Heritage Rewards points, you can claim:`,
        `${bestUnclaimedReward.icon} ${bestUnclaimedReward.title} — ${bestUnclaimedReward.description}`,
        ``,
        `Type CLAIM ${bestUnclaimedReward.id.toUpperCase()} to redeem, or visit:`,
        `https://tasteofvillagerestaurants.co.uk/rewards`,
        ``,
        `Your rewards balance: ${points} pts (${tierName})`,
      ].join('\n');

      try {
        await sendWhatsAppMessage(HAYES_PHONE_ID, phone, {
          type: 'text',
          text: { body: messageBody },
        });

        // Track that we sent this milestone notification
        await customerDoc.ref.update({
          milestone_notifications_sent: [...alreadySent, milestoneKey],
          milestone_last_notified_at: new Date().toISOString(),
        });

        sent++;
        details.push(`✅ ${phone}: ${bestUnclaimedReward.title} (${points} pts)`);
      } catch (err) {
        errors++;
        const errMsg = err instanceof Error ? err.message : String(err);
        details.push(`❌ ${phone}: ${errMsg}`);
        console.error(`[Milestones] Failed to send to ${phone}:`, err);
      }
    }

    details.push(`Done. Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
    console.info(`[Milestones] Run complete — sent=${sent} skipped=${skipped} errors=${errors}`);

    return NextResponse.json({ sent, skipped, errors, details });
  } catch (err) {
    console.error('[Milestones] Fatal error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
