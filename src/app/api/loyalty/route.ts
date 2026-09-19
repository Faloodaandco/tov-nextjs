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
      const programRes = await fetch(`${squareBaseUrl}/v2/loyalty/programs`, {
        headers: squareHeaders
      });
      if (!programRes.ok) {
        return NextResponse.json({ error: 'Loyalty program not found or active' }, { status: 500 });
      }
      const programData = await programRes.json();
      const programId = programData.programs && programData.programs[0]?.id;

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
              phone_number: formattedPhone
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Loyalty API]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
