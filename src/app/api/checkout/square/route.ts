import { NextRequest, NextResponse } from 'next/server';
import { LOCATIONS, LocationId, calculateServiceFee, calculatePromoDiscount, isEligibleForBreakfastPromo, ACTIVE_PROMO } from '@/config/shopConfig';
import { getMenuItems } from '@/services/menuService';
import { db } from '@/lib/firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

/**
 * POST /api/checkout/square
 *
 * Server-side Square order creation and payment.
 *
 * Architecture (proven in TOV-real-old/functions/src/index.ts):
 * - Uses PICKUP fulfillment type (DELIVERY is restricted closed Beta)
 * - Delivery fee added as a separate line item
 * - Delivery address embedded in ticket_name and order note
 * - Server-side price re-verification against menu JSON
 * - Branch-specific Square credentials from env vars
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cart,
      customer,
      sourceId,
      verification_token,
      branch = 'hayes',
      order_id,
      idempotency_key,
      fulfillment_type = 'collection',
      delivery_address = null,
      delivery_fee = 0,
      service_fee = 0,
      voucher_code = null,
    } = body || {};

    // ── Input Validation ──────────────────────────────────────────────
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart cannot be empty' }, { status: 400 });
    }
    if (!customer || !customer.phone || !customer.name) {
      return NextResponse.json({ error: 'Customer name and phone are required' }, { status: 400 });
    }
    if (!sourceId) {
      return NextResponse.json({ error: 'Payment source token (sourceId) is required' }, { status: 400 });
    }

    // ── Branch Configuration ──────────────────────────────────────────
    const branchId = (branch === 'slough' ? 'slough' : 'hayes') as LocationId;
    const loc = LOCATIONS[branchId];
    const isDelivery = fulfillment_type === 'delivery' && !!delivery_address;

    const locationId = loc.square.locationId;
    const token = branchId === 'hayes'
      ? process.env.SQUARE_HAYES_ACCESS_TOKEN
      : process.env.SQUARE_SLOUGH_ACCESS_TOKEN;

    if (!token) {
      console.error('[Square] Missing access token for branch:', branchId);
      return NextResponse.json(
        { error: 'Payment configuration error. Please call us to place your order.' },
        { status: 500 }
      );
    }

    const squareBaseUrl = 'https://connect.squareup.com';
    const squareHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Square-Version': '2026-07-15',
    };

    // ── Server-Side Price Re-Verification ─────────────────────────────
    const activeMenu = getMenuItems(branchId);
    let subtotalPence = 0;

    for (const item of cart) {
      if (!item.id) {
        return NextResponse.json({ error: 'Each cart item must have an id' }, { status: 400 });
      }

      const found = activeMenu.find((m) => m.id === item.id);
      if (!found) {
        return NextResponse.json(
          { error: `Unknown menu item: ${String(item.id).slice(0, 50)}. Please refresh and try again.` },
          { status: 400 }
        );
      }

      const trustedPrice = found.price;
      item.price = trustedPrice;
      item.unit_price = trustedPrice;

      const qty = Math.max(1, Math.floor(Number(item.quantity || 1)));
      subtotalPence += Math.round(trustedPrice * 100) * qty;
    }

    // Delivery fee (server-verified amount from /api/delivery/quote)
    let deliveryFeePence = 0;
    if (isDelivery) {
      deliveryFeePence = Math.max(0, Math.round(Number(delivery_fee || 0) * 100));
    }

    // Service fee (10% on food subtotal)
    const serverServiceFee = calculateServiceFee(subtotalPence / 100, branchId);
    const serviceFeePence = Math.round(serverServiceFee * 100);

    // ── Server-Side Discount Calculation ──────────────────────────────
    // Recalculate on the server — NEVER trust client-supplied discount amounts.
    // The cart items already have server-verified prices from the loop above.
    let discountPence = 0;
    let discountLabel = '';

    if (voucher_code) {
      const cartForPromo = cart.map((item: any) => {
        const found = activeMenu.find((m) => m.id === item.id);
        return {
          price: found?.price || item.price,
          quantity: Math.max(1, Math.floor(Number(item.quantity || 1))),
          category: found?.category || '',
          name: found?.name || item.name || '',
        };
      });

      const promoResult = calculatePromoDiscount(cartForPromo, voucher_code);

      if (promoResult.discount > 0 && promoResult.isTimeValid) {
        discountPence = Math.round(promoResult.discount * 100);
        discountLabel = `🎟️ ${ACTIVE_PROMO.cartLabel}`;
        console.log(`[Square] Promo ${voucher_code}: -£${promoResult.discount.toFixed(2)} on ${promoResult.eligibleItemsCount} items`);
      }
    }

    if (subtotalPence < 50) {
      return NextResponse.json({ error: 'Minimum order is £0.50' }, { status: 400 });
    }

    // Enforce minimum order for delivery (checked BEFORE discount)
    if (isDelivery && subtotalPence < loc.delivery.minOrder * 100) {
      return NextResponse.json(
        { error: `Minimum order for delivery is £${loc.delivery.minOrder.toFixed(2)}` },
        { status: 400 }
      );
    }

    const totalPence = subtotalPence - discountPence + deliveryFeePence + serviceFeePence;
    const totalPounds = totalPence / 100;

    const cleanOrderId = typeof order_id === 'string' && order_id.startsWith('ORD-')
      ? order_id.slice(0, 30)
      : `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    console.log(`[Square] Processing ${cleanOrderId} for ${loc.name}: £${totalPounds.toFixed(2)} (${isDelivery ? 'DELIVERY' : 'COLLECTION'})`);

    // ── Build Square Line Items ───────────────────────────────────────
    const squareLineItems: any[] = cart.map((item: any) => ({
      name: String(item.name || 'Menu Item').slice(0, 500),
      quantity: String(Math.max(1, Math.floor(Number(item.quantity || 1)))),
      base_price_money: {
        amount: Math.round(Number(item.price) * 100),
        currency: 'GBP',
      },
      note: item.notes ? String(item.notes).slice(0, 500) : undefined,
    }));

    // Delivery fee as line item
    if (isDelivery && deliveryFeePence > 0) {
      const outcode = delivery_address?.postcode
        ? String(delivery_address.postcode).toUpperCase().trim().split(' ')[0]
        : loc.city;
      squareLineItems.push({
        name: `🚗 Local Delivery Fee (${outcode} Fleet)`,
        quantity: '1',
        base_price_money: { amount: deliveryFeePence, currency: 'GBP' },
        note: delivery_address?.postcode ? `Delivering to ${delivery_address.postcode}` : undefined,
      });
    }

    // Service fee as line item
    if (serviceFeePence > 0) {
      squareLineItems.push({
        name: 'Service Fee (10%)',
        quantity: '1',
        base_price_money: { amount: serviceFeePence, currency: 'GBP' },
      });
    }

    // ── Format Phone ──────────────────────────────────────────────────
    let formattedPhone = String(customer.phone || '').trim().replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+44' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('44') && !formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    // ── Build Fulfillment (PICKUP workaround — DELIVERY is restricted Beta) ──
    const ticketName = isDelivery
      ? `DELIVERY: ${String(customer.name).trim()} (${delivery_address?.postcode || ''})`
      : `Pickup - ${String(customer.name).trim()}`;

    const deliveryNote = isDelivery
      ? `🚗 DRIVER DELIVERY ORDER — ${cleanOrderId}\n` +
        `Address: ${delivery_address?.line1 || ''}, ${delivery_address?.line2 ? delivery_address.line2 + ', ' : ''}${delivery_address?.city || loc.city} ${delivery_address?.postcode || ''}\n` +
        `Phone: ${formattedPhone}\n` +
        `Driver Notes: ${delivery_address?.instructions || 'None'}` +
        (delivery_address?.noContact ? '\n⚠️ NO-CONTACT DELIVERY — Leave at door' : '')
      : `Online Order ${cleanOrderId} - Ready for Collection at ${loc.name} (${loc.address})`;

    const orderPayload: any = {
      location_id: locationId,
      reference_id: cleanOrderId,
      ticket_name: ticketName,
      line_items: squareLineItems,
      fulfillments: [
        {
          type: 'PICKUP',
          state: 'PROPOSED',
          pickup_details: {
            recipient: {
              display_name: String(customer.name).trim(),
              phone_number: formattedPhone,
              email_address: customer.email?.includes('@') ? String(customer.email).trim() : undefined,
            },
            schedule_type: 'ASAP',
            note: deliveryNote,
          },
        },
      ],
    };

    // Apply discount to Square order so it shows on staff ticket
    if (discountPence > 0 && discountLabel) {
      orderPayload.discounts = [
        {
          name: discountLabel,
          type: 'FIXED_AMOUNT',
          amount_money: {
            amount: discountPence,
            currency: 'GBP',
          },
          scope: 'ORDER',
        },
      ];
    }
    // ── Search for Customer ID (For Loyalty Accumulation) ──────────────
    try {
      const searchCustomerRes = await fetch(`${squareBaseUrl}/v2/customers/search`, {
        method: 'POST',
        headers: squareHeaders,
        body: JSON.stringify({
          query: { filter: { phone_number: { exact: formattedPhone } } }
        }),
      });
      if (searchCustomerRes.ok) {
        const searchCustomerData = await searchCustomerRes.json();
        if (searchCustomerData.customers && searchCustomerData.customers.length > 0) {
          orderPayload.customer_id = searchCustomerData.customers[0].id;
        }
      }
    } catch (err) {
      console.warn('[Square] Failed to attach customer_id for loyalty', err);
    }

    // ── 1. Create Square Order ────────────────────────────────────────
    const orderIdempotencyKey = idempotency_key ? idempotency_key + '-order' : crypto.randomUUID();
    const orderRes = await fetch(`${squareBaseUrl}/v2/orders`, {
      method: 'POST',
      headers: squareHeaders,
      body: JSON.stringify({ idempotency_key: orderIdempotencyKey, order: orderPayload }),
    });

    if (!orderRes.ok) {
      const errJson: any = await orderRes.json().catch(() => ({}));
      const errMsg = errJson.errors?.[0]?.detail || `Square Order API error (HTTP ${orderRes.status})`;
      console.error('[Square] Order creation error:', errJson);
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    const orderData: any = await orderRes.json();
    const squareOrder = orderData.order;
    if (!squareOrder?.id) {
      throw new Error('Square order was not returned by API');
    }

    console.log(`[Square] Order created: ${squareOrder.id}`);

    // ── 2. Charge Payment ─────────────────────────────────────────────
    const paymentIdempotencyKey = idempotency_key ? idempotency_key + '-pay' : crypto.randomUUID();
    const finalAmountPence = squareOrder.total_money?.amount
      ? Number(squareOrder.total_money.amount)
      : totalPence;

    const paymentRes = await fetch(`${squareBaseUrl}/v2/payments`, {
      method: 'POST',
      headers: squareHeaders,
      body: JSON.stringify({
        idempotency_key: paymentIdempotencyKey,
        source_id: sourceId,
        verification_token: verification_token || undefined,
        order_id: squareOrder.id,
        location_id: locationId,
        amount_money: { amount: finalAmountPence, currency: 'GBP' },
        reference_id: cleanOrderId,
        buyer_email_address: customer.email?.includes('@') ? String(customer.email).trim() : undefined,
        note: `Taste of Village ${loc.city} ${isDelivery ? 'Delivery' : 'Collection'} Order ${cleanOrderId}`,
      }),
    });

    if (!paymentRes.ok) {
      const payErr: any = await paymentRes.json().catch(() => ({}));
      const payErrMsg = payErr.errors?.[0]?.detail || `Square Payment error (HTTP ${paymentRes.status})`;
      console.error('[Square] Payment error:', payErr);
      return NextResponse.json({ error: payErrMsg }, { status: 400 });
    }

    const payData: any = await paymentRes.json();
    const squarePayment = payData.payment;
    if (!squarePayment?.id) {
      throw new Error('Square payment ID was not returned by API');
    }

    console.log(`[Square] Payment succeeded: ${squarePayment.id}`);

    // ─────────────────────────────────────────────────────────────────
    // CRITICAL: Once payment succeeds, THE CUSTOMER HAS BEEN CHARGED.
    // Subsequent DB/email/push failures must NOT return an error.
    // ─────────────────────────────────────────────────────────────────

    const estimatedMinutes = isDelivery ? 45 : 25;
    const estimatedReadyAt = new Date(Date.now() + estimatedMinutes * 60_000);

    // ── 3. Persist Order to Firestore (server-side, survives client disconnect) ──
    try {
      await setDoc(doc(db, 'orders', cleanOrderId), {
        orderId: cleanOrderId,
        squareOrderId: squareOrder.id,
        squarePaymentId: squarePayment.id,
        status: 'paid',
        items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
        })),
        customer: { name: customer.name, phone: customer.phone },
        branch: branchId,
        fulfillmentType: isDelivery ? 'delivery' : 'collection',
        deliveryAddress: isDelivery ? delivery_address : null,
        total: totalPounds,
        subtotal: subtotalPence / 100,
        discount: discountPence / 100,
        deliveryFee: deliveryFeePence / 100,
        serviceFee: serviceFeePence / 100,
        estimatedReadyMinutes: estimatedMinutes,
        estimatedReadyAt: estimatedReadyAt.toISOString(),
        createdAt: new Date().toISOString(),
        source: 'web',
      });
      console.log(`[Square] Order ${cleanOrderId} persisted to Firestore`);
    } catch (dbErr) {
      // Log but never fail — customer is already charged
      console.error(`[Square] Firestore write failed for ${cleanOrderId}:`, dbErr);
    }

    // ── 4. Return Success ─────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      orderId: cleanOrderId,
      squareOrderId: squareOrder.id,
      squarePaymentId: squarePayment.id,
      status: 'paid',
      total: totalPounds,
      subtotal: subtotalPence / 100,
      discount: discountPence / 100,
      deliveryFee: deliveryFeePence / 100,
      serviceFee: serviceFeePence / 100,
      fulfillmentType: isDelivery ? 'delivery' : 'collection',
      deliveryAddress: isDelivery ? delivery_address : null,
      estimatedReadyMinutes: estimatedMinutes,
      estimatedReadyAt: estimatedReadyAt.toISOString(),
    });

  } catch (err: any) {
    console.error('[Square] Unexpected checkout error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process order. Please try again or call us.' },
      { status: 500 }
    );
  }
}
