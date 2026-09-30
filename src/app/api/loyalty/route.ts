import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, branch = 'hayes', customerName } = body || {};

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const token = branch === 'hayes'
      ? process.env.SQUARE_HAYES_ACCESS_TOKEN
      : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;

    if (!token) {
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const squareBaseUrl = 'https://connect.squareup.com';
    const squareHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Square-Version': '2026-07-15',
    };

    let formattedPhone = String(phone).trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+44' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('44') && !formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    if (action === 'check') {
      // 1. Search for customer by phone
      let customerId = null;
      const searchCustomerRes = await fetch(`${squareBaseUrl}/v2/customers/search`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          query: {
            filter: {
              phone_number: { exact: formattedPhone }
            }
          }
        }),
      });

      if (searchCustomerRes.ok) {
        const searchCustomerData = await searchCustomerRes.json();
        if (searchCustomerData.customers && searchCustomerData.customers.length > 0) {
          customerId = searchCustomerData.customers[0].id;
        }
      }

      if (!customerId) {
        return NextResponse.json({ status: 'no_account', balance: 0, customerId: null });
      }

      // 2. Search for loyalty account by customer ID
      const searchLoyaltyRes = await fetch(`${squareBaseUrl}/v2/loyalty/accounts/search`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          query: {
            customer_ids: [customerId]
          }
        }),
      });

      if (searchLoyaltyRes.ok) {
        const searchLoyaltyData = await searchLoyaltyRes.json();
        if (searchLoyaltyData.loyalty_accounts && searchLoyaltyData.loyalty_accounts.length > 0) {
          const account = searchLoyaltyData.loyalty_accounts[0];
          return NextResponse.json({
            status: 'found',
            balance: account.balance || 0,
            accountId: account.id,
            customerId: customerId
          });
        }
      }

      return NextResponse.json({ status: 'no_loyalty_account', balance: 0, customerId: customerId });
    }

    if (action === 'enroll') {
      // 1. Check if customer exists or create one
      let customerId = null;
      const searchCustomerRes = await fetch(`${squareBaseUrl}/v2/customers/search`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          query: {
            filter: {
              phone_number: { exact: formattedPhone }
            }
          }
        }),
      });

      if (searchCustomerRes.ok) {
        const searchCustomerData = await searchCustomerRes.json();
        if (searchCustomerData.customers && searchCustomerData.customers.length > 0) {
          customerId = searchCustomerData.customers[0].id;
        }
      }

      if (!customerId) {
        const createCustomerRes = await fetch(`${squareBaseUrl}/v2/customers`, {
          method: 'POST',
          headers: squareHeaders,
          body: JSON.stringify({
            given_name: customerName || 'Valued Customer',
            phone_number: formattedPhone,
            idempotency_key: crypto.randomUUID()
          }),
        });

        if (createCustomerRes.ok) {
          const createCustomerData = await createCustomerRes.json();
          customerId = createCustomerData.customer.id;
        } else {
          return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
        }
      }

      // 2. Get loyalty program to find program_id
      const programRes = await fetch(`${squareBaseUrl}/v2/loyalty/programs/main`, {
        headers: squareHeaders
      });
      if (!programRes.ok) {
        return NextResponse.json({ error: 'Loyalty program not found or active' }, { status: 500 });
      }
      const programData = await programRes.json();
      const programId = programData.program?.id;

      if (!programId) {
        return NextResponse.json({ error: 'No active loyalty program' }, { status: 500 });
      }

      // 3. Create loyalty account
      const createAccountRes = await fetch(`${squareBaseUrl}/v2/loyalty/accounts`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          loyalty_account: {
            program_id: programId,
            customer_id: customerId,
            mapping: {
              type: 'PHONE',
              value: formattedPhone
            }
          }
        }),
      });

      if (createAccountRes.ok) {
        const createAccountData = await createAccountRes.json();
        return NextResponse.json({
          status: 'enrolled',
          balance: createAccountData.loyalty_account.balance || 0,
          accountId: createAccountData.loyalty_account.id,
          customerId: customerId
        });
      } else {
        const err = await createAccountRes.json();
        return NextResponse.json({ error: 'Failed to create loyalty account', details: err }, { status: 500 });
      }
    }

    if (action === 'program') {
      // Return the loyalty program details including reward tiers
      const programRes = await fetch(`${squareBaseUrl}/v2/loyalty/programs/main`, {
        headers: squareHeaders,
      });

      if (!programRes.ok) {
        return NextResponse.json({ error: 'Loyalty program not found' }, { status: 404 });
      }

      const programData = await programRes.json();
      const program = programData.program;

      if (!program) {
        return NextResponse.json({ error: 'No active loyalty program' }, { status: 404 });
      }

      // Extract reward tiers with human-readable info
      const rewardTiers = (program.reward_tiers || []).map((tier: any) => ({
        id: tier.id,
        name: tier.name,
        points: tier.points,
        discount: tier.definition?.discount_type === 'FIXED_AMOUNT'
          ? { type: 'fixed', amount: tier.definition.fixed_discount_money?.amount || 0, currency: 'GBP' }
          : tier.definition?.discount_type === 'FIXED_PERCENTAGE'
            ? { type: 'percentage', percentage: tier.definition.percentage_discount || '0' }
            : null,
        scope: tier.definition?.scope || 'ORDER',
      }));

      return NextResponse.json({
        programId: program.id,
        programName: program.terminology?.one || 'Point',
        programNamePlural: program.terminology?.other || 'Points',
        rewardTiers,
        accrualRules: program.accrual_rules,
      });
    }

    if (action === 'create_reward') {
      // Create a loyalty reward linked to an order.
      // This locks the points and attaches the reward discount to the order.
      // Called AFTER order creation, BEFORE payment.
      const { loyaltyAccountId, rewardTierId, orderId } = body;

      if (!loyaltyAccountId || !rewardTierId || !orderId) {
        return NextResponse.json(
          { error: 'loyaltyAccountId, rewardTierId, and orderId are required' },
          { status: 400 },
        );
      }

      const createRewardRes = await fetch(`${squareBaseUrl}/v2/loyalty/rewards`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          reward: {
            loyalty_account_id: loyaltyAccountId,
            reward_tier_id: rewardTierId,
            order_id: orderId,
          },
        }),
      });

      if (!createRewardRes.ok) {
        const err = await createRewardRes.json().catch(() => ({}));
        const errMsg = (err as any).errors?.[0]?.detail || 'Failed to create loyalty reward';
        console.error('[Loyalty] Create reward error:', err);
        return NextResponse.json({ error: errMsg }, { status: 400 });
      }

      const rewardData = await createRewardRes.json();
      const reward = rewardData.reward;

      console.info(`[Loyalty] Reward created: ${reward.id} (${reward.points} pts locked for order ${orderId})`);

      return NextResponse.json({
        status: 'reward_created',
        rewardId: reward.id,
        pointsLocked: reward.points,
        orderId: reward.order_id,
      });
    }

    if (action === 'redeem_reward') {
      // Finalize the reward redemption after payment.
      // This permanently deducts the locked points.
      // Note: Square auto-redeems when using Orders API + Payments API,
      // but we call this explicitly as a safety net.
      const { rewardId, locationId } = body;

      if (!rewardId || !locationId) {
        return NextResponse.json(
          { error: 'rewardId and locationId are required' },
          { status: 400 },
        );
      }

      const redeemRes = await fetch(`${squareBaseUrl}/v2/loyalty/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          location_id: locationId,
        }),
      });

      if (!redeemRes.ok) {
        const err = await redeemRes.json().catch(() => ({}));
        console.error('[Loyalty] Redeem error:', err);
        // Don't fail — Square may have auto-redeemed already
        return NextResponse.json({ status: 'redeem_attempted', error: 'May have been auto-redeemed by Square' });
      }

      const redeemData = await redeemRes.json();
      console.info(`[Loyalty] Reward ${rewardId} redeemed successfully`);

      return NextResponse.json({
        status: 'redeemed',
        event: redeemData.event,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Valid actions: check, enroll, program, create_reward, redeem_reward' }, { status: 400 });
  } catch (err: any) {
    console.error('[Loyalty API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
