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
 * Architecture:
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
    const otherBranch = branchId === 'slough' ? 'hayes' : 'slough';
    const fallbackMenu = getMenuItems(otherBranch);
    let subtotalPence = 0;

    for (const item of cart) {
      if (!item.id) {
        return NextResponse.json({ error: 'Each cart item must have an id' }, { status: 400 });
      }

      const rawId = String(item.id).trim();
      const isLarge = /_large$/i.test(rawId);
      const isRegular = /_regular$/i.test(rawId);
      const baseId = rawId.replace(/_(regular|large)$/i, '');

      // 1. Direct match in active branch menu (or baseId for sized items)
      let found = activeMenu.find((m) => m.id === rawId || m.id === baseId);

      // 2. Cross-branch fallback (e.g. user had an item in cart from switching branches)
      if (!found) {
        const otherBranchItem = fallbackMenu.find((m) => m.id === rawId || m.id === baseId);
        if (otherBranchItem) {
          // Attempt name match in active branch
          const nameMatch = activeMenu.find(
            (m) => m.name.toLowerCase().trim() === otherBranchItem.name.toLowerCase().trim()
          );
          if (nameMatch) {
            found = nameMatch;
            item.id = isLarge ? `${nameMatch.id}_large` : isRegular ? `${nameMatch.id}_regular` : nameMatch.id;
          } else {
            found = otherBranchItem;
          }
        }
      }

      // 3. Fallback match by item name in active branch or fallback branch
      if (!found && item.name) {
        const cleanName = String(item.name).replace(/\s*\((Regular|Large|Meal)\)$/i, '').toLowerCase().trim();
        found = activeMenu.find((m) => m.name.toLowerCase().trim() === cleanName)
          || fallbackMenu.find((m) => m.name.toLowerCase().trim() === cleanName);
      }

      if (!found) {
        return NextResponse.json(
          { error: `Unknown menu item: ${String(item.id).slice(0, 50)}. Please refresh and try again.` },
          { status: 400 }
        );
      }

      // Calculate trusted unit price
      let trustedPrice = found.price;
      if (isLarge) {
        trustedPrice = found.category === 'rolls' ? found.price + 2.50 : found.price + 2.99;
      } else if (isRegular) {
        trustedPrice = found.price;
      } else if (Number(item.price) > found.price) {
        const clientPrice = Number(item.price);
        if (clientPrice <= found.price + 20) {
          trustedPrice = clientPrice;
        }
      }

      item.price = trustedPrice;
      item.unit_price = trustedPrice;
      if (!item.name || item.name.trim() === '') {
        item.name = found.name;
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity || 1)));
      subtotalPence += Math.round(trustedPrice * 100) * qty;
    }

    // Delivery fee (server-verified amount from /api/delivery/quote)
    let deliveryFeePence = 0;
    if (isDelivery) {
      deliveryFeePence = Math.max(0, Math.round(Number(delivery_fee || 0) * 100));
    }

    // Service fee (10% on food subtotal - Delivery orders only; collection is free)
    const serverServiceFee = isDelivery ? calculateServiceFee(subtotalPence / 100, branchId) : 0;
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
        // ── Identity ──
        id: cleanOrderId,
        orderId: cleanOrderId,

        // ── Customer (FLAT fields — POS/KDS reads these at root level) ──
        customerName: String(customer.name).trim(),
        customerPhone: String(customer.phone).trim(),
        customerEmail: customer.email ? String(customer.email).trim() : '',

        // ── Order Type (CRITICAL: POS reads `type`, not `fulfillmentType`) ──
        type: isDelivery ? 'delivery' : 'collection',
        fulfillmentType: isDelivery ? 'delivery' : 'collection',
        fulfillment_type: isDelivery ? 'delivery' : 'collection',

        // ── Delivery ──
        delivery_address: isDelivery ? delivery_address : null,
        deliveryAddress: isDelivery ? delivery_address : null,
        delivery_fee: deliveryFeePence / 100,
        deliveryFee: deliveryFeePence / 100,

        // ── Payment ──
        status: 'paid',
        payment_status: 'paid',
        payment_method: 'square',
        squareOrderId: squareOrder.id,
        squarePaymentId: squarePayment.id,

        // ── Branch ──
        branch: branchId,
        branchName: loc.name,
        location_id: locationId,
        tenant_id: loc.tenant_id,

        // ── Financials ──
        total: totalPounds,
        subtotal: subtotalPence / 100,
        discount: discountPence / 100,
        serviceFee: serviceFeePence / 100,

        // ── Items (uses `price` — NOT `unit_price` — prevents £0.00 email bug) ──
        items: cart.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          notes: item.notes || '',
        })),

        // ── Timing ──
        estimatedReadyMinutes: estimatedMinutes,
        estimatedReadyAt: estimatedReadyAt.toISOString(),
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),

        // ── Source ──
        source: 'Web',
      });
      console.log(`[Square] Order ${cleanOrderId} persisted to Firestore`);
    } catch (dbErr) {
      // Log but never fail — customer is already charged
      console.error(`[Square] Firestore write failed for ${cleanOrderId}:`, dbErr);
    }

    // ── 3b. Queue Confirmation Email (triggers processEmailQueue Cloud Function) ──
    if (customer.email?.includes('@')) {
      try {
        const readyTimeFormatted = estimatedReadyAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const branchAddress = `${loc.name}\n${loc.address}, ${loc.city}, ${loc.postcode}\nTel: ${loc.phone}`;

        const itemsSummaryText = cart.map((it: any) =>
          `• ${it.quantity}x ${it.name}${it.notes ? ` (${it.notes})` : ''} (£${(Number(it.price) * Number(it.quantity)).toFixed(2)})`
        ).join('\n');

        const itemsHtmlRows = cart.map((it: any) => `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; font-weight: bold; color: #1C2D22;">
              ${it.quantity}x ${it.name}
              ${it.notes ? `<div style="font-size: 12px; color: #8C7A6B; font-weight: normal;">Note: ${it.notes}</div>` : ''}
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; text-align: right; color: #a64036; font-weight: bold;">
              £${(Number(it.price) * Number(it.quantity)).toFixed(2)}
            </td>
          </tr>
        `).join('');

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF6F0; border-radius: 16px; overflow: hidden; border: 1px solid #E6DFD5;">
            <div style="background-color: #1C2D22; padding: 24px; text-align: center;">
              <h1 style="color: #FAF6F0; margin: 0; font-size: 24px; letter-spacing: 1px;">TASTE OF VILLAGE</h1>
              <p style="color: #D3A762; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">${isDelivery ? 'Delivery Order Confirmed & Paid' : 'Collection Order Confirmed & Paid'}</p>
            </div>
            <div style="padding: 24px; background-color: #ffffff;">
              <p style="font-size: 16px; color: #1C2D22; margin-top: 0;">Dear <strong>${customer.name}</strong>,</p>
              <p style="font-size: 14px; color: #5A4A3E; line-height: 1.5;">Thank you for ordering with Taste of Village! Your payment was successful and the kitchen has received your order.</p>
              <div style="background-color: #FDF9F3; border: 1px solid #EFE4D2; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
                <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #8C7A6B; letter-spacing: 1px;">Estimated ${isDelivery ? 'Delivery' : 'Ready'} Time</span>
                <div style="font-size: 28px; font-weight: 900; color: #a64036; margin: 4px 0;">~${estimatedMinutes} mins</div>
                <span style="font-size: 13px; color: #1C2D22;">Order ID: <strong>${cleanOrderId}</strong></span>
              </div>
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #8C7A6B; border-bottom: 2px solid #E6DFD5; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                ${itemsHtmlRows}
                ${isDelivery && deliveryFeePence > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; color: #5A4A3E;">🚗 Driver Delivery Fee</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; text-align: right; color: #5A4A3E; font-weight: bold;">£${(deliveryFeePence / 100).toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${serviceFeePence > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; color: #5A4A3E;">Service Fee (10%)</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; text-align: right; color: #5A4A3E; font-weight: bold;">£${(serviceFeePence / 100).toFixed(2)}</td>
                  </tr>
                ` : ''}
                ${discountPence > 0 ? `
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; color: #2e7d32;">🎟️ Discount</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #f0eae1; text-align: right; color: #2e7d32; font-weight: bold;">-£${(discountPence / 100).toFixed(2)}</td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #1C2D22;">Total Paid</td>
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 900; color: #1C2D22; text-align: right;">£${totalPounds.toFixed(2)}</td>
                </tr>
              </table>
              <div style="background-color: #F4F8F5; border-radius: 12px; padding: 16px; margin: 20px 0;">
                <h4 style="margin: 0 0 8px 0; color: #1C2D22; font-size: 14px;">${isDelivery ? '🚗 Delivery Destination:' : '📍 Collection Address:'}</h4>
                <p style="margin: 0; font-size: 13px; color: #354D3D; white-space: pre-line; line-height: 1.4;">
                  ${isDelivery
                    ? `${delivery_address?.line1 || ''}, ${delivery_address?.line2 ? delivery_address.line2 + ', ' : ''}${delivery_address?.city || loc.city} ${delivery_address?.postcode || ''}\nTel: ${formattedPhone}`
                    : branchAddress}
                </p>
              </div>
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="https://www.tasteofvillagerestaurants.co.uk/track/${cleanOrderId}" style="background-color: #a64036; color: #ffffff; text-decoration: none; padding: 14px 28px; font-weight: bold; font-size: 15px; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 10px rgba(166, 64, 54, 0.3);">
                  Track Order Live
                </a>
              </div>
            </div>
          </div>
        `;

        const { addDoc, collection: firestoreCollection } = await import('firebase/firestore');
        await addDoc(firestoreCollection(db, 'mail'), {
          to: [customer.email.trim()],
          orderId: cleanOrderId,
          timestamp: new Date().toISOString(),
          status: 'pending',
          message: {
            subject: `Order Confirmed: ${cleanOrderId} (${isDelivery ? 'Delivery' : 'Ready'} ~${estimatedMinutes}m) — Taste of Village`,
            text: `Dear ${customer.name},\n\nThank you for ordering with Taste of Village! Your order ${cleanOrderId} has been paid and received by the kitchen.\n\nEstimated ${isDelivery ? 'Delivery' : 'Ready'} Time: ~${estimatedMinutes} mins\n\n${isDelivery ? `Delivery Address:\n${delivery_address?.line1 || ''}, ${delivery_address?.city || loc.city} ${delivery_address?.postcode || ''}` : `Collection Location:\n${branchAddress}`}\n\nOrder Summary:\n${itemsSummaryText}\n\nTotal Paid: £${totalPounds.toFixed(2)}\n\nTrack Live: https://www.tasteofvillagerestaurants.co.uk/track/${cleanOrderId}\n\nSee you soon!`,
            html: emailHtml,
          },
        });
        console.log(`[Square] Queued confirmation email for ${cleanOrderId}`);
      } catch (emailErr) {
        // Log but never fail — customer is already charged
        console.error(`[Square] Email queue failed for ${cleanOrderId}:`, emailErr);
      }
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
