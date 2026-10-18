/**
 * Loyalty Milestone Engine
 *
 * Detects when a customer is close to a reward threshold
 * and generates smart, contextual nudge messages.
 *
 * Trigger Points:
 *  - After every payment, check if the new balance crosses or nears a milestone
 *  - "Your next £X order will unlock [reward]!"
 *  - "Congratulations! You just unlocked [reward]! Claim it now."
 *
 * Integrated into Square webhook's after() block.
 */

import { REWARDS_CATALOGUE, type RewardTier } from '@/services/RewardService';
import { TIER_NAMES } from '@/services/serverCustomerService';

// ── Types ──────────────────────────────────────────────────────────────

export interface MilestoneNudge {
  type: 'just_unlocked' | 'close_to_unlock' | 'tier_upgrade';
  reward?: RewardTier;
  pointsNeeded?: number;
  currentPoints: number;
  tierName?: string;
  /** Pre-formatted WhatsApp message body */
  whatsappMessage: string;
  /** Pre-formatted HTML message for Telegram */
  telegramMessage: string;
}

// ── Engine ──────────────────────────────────────────────────────────────

/**
 * Analyses a customer's post-order points and generates
 * appropriate milestone nudges.
 *
 * @param pointsBefore   Points BEFORE this order
 * @param pointsAfter    Points AFTER this order (includes points just earned)
 * @param customerName   Customer's name for personalisation
 * @param orderTotal     Order total in pounds (for "just £X more" calculations)
 * @returns Array of nudges to send (usually 0 or 1)
 */
export function detectMilestoneNudges(
  pointsBefore: number,
  pointsAfter: number,
  customerName: string,
  orderTotal: number,
): MilestoneNudge[] {
  const nudges: MilestoneNudge[] = [];
  const name = customerName.split(' ')[0] || 'there';

  // ── 1. Just Unlocked a Reward ──────────────────────────────────────
  // Customer crossed a reward threshold with this order
  for (const reward of REWARDS_CATALOGUE) {
    if (pointsBefore < reward.pointsCost && pointsAfter >= reward.pointsCost) {
      nudges.push({
        type: 'just_unlocked',
        reward,
        currentPoints: pointsAfter,
        whatsappMessage: [
          `🎉 *Congratulations ${name}!*`,
          ``,
          `You just unlocked *${reward.title}*! ${reward.icon}`,
          `${reward.description}`,
          ``,
          `🏆 *Your balance: ${pointsAfter} points*`,
          ``,
          `Claim your reward on our website:`,
          `https://tasteofvillagerestaurants.co.uk/rewards`,
          ``,
          `Or reply *CLAIM ${reward.id.toUpperCase()}* to claim right here! 🎫`,
        ].join('\n'),
        telegramMessage: [
          `🎉 <b>Congratulations ${escapeHtml(name)}!</b>`,
          ``,
          `You just unlocked <b>${escapeHtml(reward.title)}</b>! ${reward.icon}`,
          `${escapeHtml(reward.description)}`,
          ``,
          `🏆 <b>Your balance: ${pointsAfter} points</b>`,
          ``,
          `Claim your reward: https://tasteofvillagerestaurants.co.uk/rewards`,
        ].join('\n'),
      });
    }
  }

  // ── 2. Close to a Reward ───────────────────────────────────────────
  // Customer is within striking distance of the NEXT unclaimed reward
  if (nudges.length === 0) {
    // Find the next reward they haven't unlocked yet
    const nextReward = REWARDS_CATALOGUE
      .filter(r => pointsAfter < r.pointsCost)
      .sort((a, b) => a.pointsCost - b.pointsCost)[0];

    if (nextReward) {
      const pointsNeeded = nextReward.pointsCost - pointsAfter;
      // Only nudge if they're within 50 points OR within ~2 average orders
      const isClose = pointsNeeded <= 50 || pointsNeeded <= Math.ceil(orderTotal * 2.5);

      if (isClose) {
        // Calculate what spend would unlock it
        const spendNeeded = `£${pointsNeeded.toFixed(0)}`;

        nudges.push({
          type: 'close_to_unlock',
          reward: nextReward,
          pointsNeeded,
          currentPoints: pointsAfter,
          whatsappMessage: [
            `⭐ *So close, ${name}!*`,
            ``,
            `You're only *${pointsNeeded} points* away from unlocking:`,
            `${nextReward.icon} *${nextReward.title}* — ${nextReward.description}`,
            ``,
            `Just *${spendNeeded} more* in orders and it's yours! 🔥`,
            ``,
            `Order now: https://tasteofvillagerestaurants.co.uk`,
          ].join('\n'),
          telegramMessage: [
            `⭐ <b>So close, ${escapeHtml(name)}!</b>`,
            ``,
            `You're only <b>${pointsNeeded} points</b> away from unlocking:`,
            `${nextReward.icon} <b>${escapeHtml(nextReward.title)}</b> — ${escapeHtml(nextReward.description)}`,
            ``,
            `Just <b>${spendNeeded} more</b> in orders and it's yours! 🔥`,
          ].join('\n'),
        });
      }
    }
  }

  // ── 3. Tier Upgrade ────────────────────────────────────────────────
  // Check if customer crossed a tier boundary
  const tierThresholds = [
    { points: 500, from: 'bronze', to: 'silver' },
    { points: 1000, from: 'silver', to: 'gold' },
  ];

  for (const tier of tierThresholds) {
    if (pointsBefore < tier.points && pointsAfter >= tier.points) {
      const newTierName = TIER_NAMES[tier.to] || tier.to;
      nudges.push({
        type: 'tier_upgrade',
        currentPoints: pointsAfter,
        tierName: newTierName,
        whatsappMessage: [
          `🏅 *Tier Upgrade!*`,
          ``,
          `Welcome to *${newTierName}*, ${name}! 🎊`,
          `Your loyalty and love for our food hasn't gone unnoticed.`,
          ``,
          `Keep earning points and unlock even bigger rewards!`,
          `View your rewards: https://tasteofvillagerestaurants.co.uk/rewards`,
        ].join('\n'),
        telegramMessage: [
          `🏅 <b>Tier Upgrade!</b>`,
          ``,
          `Welcome to <b>${escapeHtml(newTierName)}</b>, ${escapeHtml(name)}! 🎊`,
          `Your loyalty hasn't gone unnoticed.`,
          ``,
          `View rewards: https://tasteofvillagerestaurants.co.uk/rewards`,
        ].join('\n'),
      });
    }
  }

  return nudges;
}

// ── Helper ─────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
