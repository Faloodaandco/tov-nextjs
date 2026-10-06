import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWhatsAppMessage } from '@/lib/waba';
import { createItemisedCheckoutLink, type CheckoutLineItem } from '@/lib/square';
import {
  getMenuItemById,
  buildMenuCategorySections,
  buildItemListRows,
  getSectionTitle,
  formatPrice,
  isCurryItem,
  cartHasBread,
  buildDeliveryProgressBar,
  MEAL_DEAL,
  BRIDGE_ITEMS,
} from '@/lib/wabaMenu';
import {
  LOCATIONS,
  haversineDistanceMiles,
  getDeliveryFeeByDistance,
} from '@/config/shopConfig';

// ── Types ────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  pricePence: number;
}

interface ConversationState {
  state: 'idle' | 'awaiting_postcode' | 'awaiting_address';
  pendingDelivery?: {
    postcode: string;
    miles: number;
    deliveryFeePence: number;
  };
  activeCart?: {
    items: CartItem[];
    basePence: number;
    updatedAt: string;
    checkoutLink?: string;
    checkoutOrderId?: string;
    checkoutReferenceId?: string;
    checkoutAt?: string;
  };
  lastPaidOrderId?: string;
  lastPaidAt?: string;
}

// ── Constants ────────────────────────────────────────────────────────
const BRANCH_ID = 'hayes' as const;
const LOC = LOCATIONS[BRANCH_ID];

// ── Firestore Helpers ────────────────────────────────────────────────
async function getConversation(phone: string): Promise<ConversationState> {
  try {
    const snap = await adminDb.collection('whatsapp_conversations').doc(phone).get();
    const data = snap.data();
    return {
      state: data?.state || 'idle',
      pendingDelivery: data?.pendingDelivery || undefined,
      activeCart: data?.activeCart || undefined,
      lastPaidOrderId: data?.lastPaidOrderId || undefined,
      lastPaidAt: data?.lastPaidAt || undefined,
    };
  } catch {
    return { state: 'idle' };
  }
}

async function updateConversation(phone: string, updates: Record<string, unknown>) {
  try {
    await adminDb.collection('whatsapp_conversations').doc(phone).set(updates, { merge: true });
  } catch (e) {
    console.error('[TOV WABA] Firestore write error:', e);
  }
}

// ── Cart Helpers ─────────────────────────────────────────────────────
function addToCart(cart: CartItem[] | undefined, item: CartItem): CartItem[] {
  const items = [...(cart || [])];
  const existing = items.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    items.push(item);
  }
  return items;
}

function cartTotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.pricePence * i.quantity, 0);
}

function cartSummaryText(items: CartItem[]): string {
  return items
    .map(i => `${i.quantity}x ${i.name} — ${formatPrice((i.pricePence * i.quantity) / 100)}`)
    .join('\n');
}

// ── Postcode Geocoding (Postcodes.io — free, no API key) ─────────────
async function geocodePostcode(postcode: string): Promise<{
  valid: boolean;
  lat?: number;
  lng?: number;
  formatted?: string;
  outcode?: string;
}> {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(clean)}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return { valid: false };
    const data = await res.json();
    if (data.status !== 200 || !data.result) return { valid: false };
    return {
      valid: true,
      lat: data.result.latitude,
      lng: data.result.longitude,
      formatted: data.result.postcode,
      outcode: data.result.outcode,
    };
  } catch {
    return { valid: false };
  }
}

// ══════════════════════════════════════════════════════════════════════
// GET — Meta Webhook Verification Handshake
// ══════════════════════════════════════════════════════════════════════
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ══════════════════════════════════════════════════════════════════════
// POST — Incoming WhatsApp Messages
// ══════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // ── Signature Verification ──────────────────────────────────────
    const signature = request.headers.get('x-hub-signature-256');
    const isProxy = request.headers.get('x-tenant-proxy') === 'falooda-master';
    const secret = process.env.WABA_APP_SECRET || process.env.META_APP_SECRET;

    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature);
      const digBuf = Buffer.from(digest);
      if (sigBuf.length !== digBuf.length || !crypto.timingSafeEqual(sigBuf, digBuf)) {
        return new NextResponse('Invalid signature', { status: 403 });
      }
    } else if (!isProxy) {
      return new NextResponse('Missing signature', { status: 403 });
    }

    const body = JSON.parse(rawBody);

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const phoneId = change.value?.metadata?.phone_number_id;
        const messages = change.value?.messages || [];
        const contacts = change.value?.contacts || [];

        for (const message of messages) {
          // ── Deduplication ───────────────────────────────────────
          try {
            const dedupRef = adminDb.collection('webhook_dedup').doc(`tov_${message.id}`);
            const dedupSnap = await dedupRef.get();
            if (dedupSnap.exists) continue;
            await dedupRef.set({
              messageId: message.id,
              processedAt: new Date().toISOString(),
              expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
          } catch (err) {
            console.warn('[TOV WABA] Dedup check failed, processing anyway:', err);
          }

          const from = message.from;
          const profileName = contacts[0]?.profile?.name || from;

          try {
            if (message.type === 'text') {
              await handleTextMessage(phoneId, from, profileName, message.text?.body || '');
            } else if (message.type === 'interactive') {
              await handleInteractiveMessage(phoneId, from, profileName, message);
            } else if (message.type === 'order') {
              await handleOrderMessage(phoneId, from, profileName, message);
            }
          } catch (msgErr) {
            console.error(`[TOV WABA] Error handling message ${message.id}:`, msgErr);
          }
        }
      }
    }

    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('[TOV WABA] Webhook Fatal Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// ══════════════════════════════════════════════════════════════════════
// Message Handlers
// ══════════════════════════════════════════════════════════════════════

async function handleTextMessage(phoneId: string, from: string, name: string, rawText: string) {
  // Log conversation
  await updateConversation(from, {
    phone: from,
    name,
    lastMessage: rawText,
    timestamp: new Date().toISOString(),
  });

  const conv = await getConversation(from);
  const text = rawText.toLowerCase().trim();

  // ── State: awaiting postcode for delivery ──────────────────────
  if (conv.state === 'awaiting_postcode') {
    await handlePostcodeInput(phoneId, from, name, rawText, conv);
    return;
  }

  // ── State: awaiting street address for delivery ─────────────────
  if (conv.state === 'awaiting_address') {
    await handleAddressInput(phoneId, from, name, rawText, conv);
    return;
  }

  // ── Intent: Clear / Cancel / Reset ─────────────────────────────
  if (/\b(clear|cancel|reset|start over)\b/.test(text)) {
    await updateConversation(from, { activeCart: null, state: 'idle', pendingDelivery: null });
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '🗑️ Basket cleared. Type *Menu* whenever you are ready to start fresh!' },
    });
    return;
  }

  // ── Intent: Check Cart / Basket / Active Payment Link ───────────
  if (/\b(cart|basket|my order|checkout link|link|pay)\b/.test(text)) {
    if (conv.activeCart?.items?.length) {
      const total = conv.activeCart.basePence;
      const checkoutLink = conv.activeCart.checkoutLink;
      if (checkoutLink) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: {
            preview_url: false,
            body: [
              `🛒 *Your Active Order:*`,
              cartSummaryText(conv.activeCart.items),
              ``,
              `*Total: ${formatPrice(total / 100)}*`,
              ``,
              `💳 Complete your payment here:`,
              checkoutLink,
              ``,
              `_Type *Clear* to discard this order and start a new one._`,
            ].join('\n'),
          },
        });
        return;
      }

      await sendFulfillmentChoice(phoneId, from, conv.activeCart);
      return;
    } else {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: '🛒 Your basket is currently empty. Type *Menu* to browse dishes or view our catalog!' },
      });
      return;
    }
  }

  // ── Intent: Halal certification query ──────────────────────────
  if (/\b(halal|hmc)\b/.test(text)) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        body: '✅ *100% Halal Certified*\n\nAll meats, poultry, and ingredients at Taste of Village are strictly 100% Halal certified and prepared under the highest hygiene standards.\n\nType *Menu* to browse our dishes!',
      },
    });
    return;
  }

  // ── Intent: menu / food / order ────────────────────────────────
  if (/\b(menu|food|order|browse|dishes|eat)\b/.test(text)) {
    await sendCategoryList(phoneId, from);
    return;
  }

  // ── Intent: I paid / Check Payment ─────────────────────────────
  if (/\b(i paid|payment done|just paid|paid already|confirm payment)\b/.test(text)) {
    const activeRef = conv.activeCart?.checkoutReferenceId || conv.activeCart?.checkoutOrderId;
    if (activeRef) {
      try {
        const orderSnap = await adminDb.collection('whatsapp_orders').doc(activeRef).get();
        if (orderSnap.exists && orderSnap.data()?.status === 'PAID') {
          await sendWhatsAppMessage(phoneId, from, {
            type: 'text',
            text: {
              body: `✅ *Payment Verified!* Your order #${activeRef} has been received and confirmed by the kitchen. Fresh food is being prepared right now! 👨‍🍳🔥`,
            },
          });
          return;
        }
      } catch (err) {
        console.warn('[TOV WABA] Error checking payment status:', err);
      }
    }

    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        body: '⏳ Thank you! Square is confirming your transaction. Once completed, your receipt will automatically appear here and on our kitchen screen.\n\nIf you experienced any card issue, reply to this chat anytime.',
      },
    });
    return;
  }

  // ── Intent: help / hours / location ────────────────────────────
  if (/\b(help|hours|time|open|close|where|address|location)\b/.test(text)) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: `📍 *${LOC.name}*\n${LOC.address}, ${LOC.city} ${LOC.postcode}\n📞 ${LOC.phone}\n\n🕐 Open daily\n\nTo order, type *Menu* or browse our catalog.`,
      },
    });
    return;
  }

  // ── Default: Welcome ───────────────────────────────────────────
  await sendWelcome(phoneId, from, name, conv);
}

async function handleInteractiveMessage(phoneId: string, from: string, name: string, message: any) {
  const replyType = message.interactive.type;

  if (replyType === 'list_reply') {
    const listId: string = message.interactive.list_reply.id;

    // Category selected → show items
    if (listId.startsWith('cat_')) {
      const rows = buildItemListRows(listId);
      if (rows.length === 0) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: 'This category is currently empty. Try another!' },
        });
        return;
      }

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: getSectionTitle(listId) },
          body: { text: 'Tap an item to add it to your order:' },
          footer: { text: `Taste of Village ${LOC.city}` },
          action: {
            button: 'Select Item',
            sections: [{ title: getSectionTitle(listId), rows }],
          },
        },
      });
      return;
    }

    // Item selected → add to cart + psychology upsells
    const menuItem = getMenuItemById(listId);
    if (menuItem) {
      const conv = await getConversation(from);
      const newItems = addToCart(conv.activeCart?.items, {
        id: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        pricePence: Math.round(menuItem.price * 100),
      });
      const total = cartTotal(newItems);

      await updateConversation(from, {
        activeCart: { items: newItems, basePence: total, updatedAt: new Date().toISOString() },
        state: 'idle',
      });

      // Free delivery progress bar (nearest tier threshold = £30)
      const progressBar = buildDeliveryProgressBar(total, 3000);

      // Psychology: If curry added → "Make it a Meal" upsell (Thaler's Mental Accounting)
      if (isCurryItem(menuItem)) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: `Added: ${menuItem.name}` },
            body: {
              text: [
                `✅ *${menuItem.name}* (${formatPrice(menuItem.price)}) added!`,
                '',
                `🍽️ *Make it a Meal for +${formatPrice(MEAL_DEAL.extraPricePence / 100)}?*`,
                `Includes: ${MEAL_DEAL.includes}`,
                `_(Save ${MEAL_DEAL.savings} vs ordering separately)_`,
                '',
                progressBar,
              ].join('\n'),
            },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'tov_meal_deal', title: '✅ Upgrade to Meal' } },
                { type: 'reply', reply: { id: 'tov_add_more', title: '📋 Add More' } },
                { type: 'reply', reply: { id: 'tov_checkout', title: '🛒 Checkout' } },
              ],
            },
          },
        });
      } else {
        // Non-curry: standard add confirmation with progress bar
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: `Added: ${menuItem.name}` },
            body: {
              text: [
                `✅ *${menuItem.name}* (${formatPrice(menuItem.price)}) added!`,
                '',
                `🛒 *Your basket:*`,
                cartSummaryText(newItems),
                `*Total: ${formatPrice(total / 100)}*`,
                '',
                progressBar,
              ].join('\n'),
            },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'tov_checkout', title: '🛒 Checkout' } },
                { type: 'reply', reply: { id: 'tov_add_more', title: '📋 Add More' } },
                { type: 'reply', reply: { id: 'tov_clear_cart', title: '🗑️ Clear' } },
              ],
            },
          },
        });
      }
    }
    return;
  }

  if (replyType === 'button_reply') {
    const buttonId: string = message.interactive.button_reply.id;

    // ── Checkout → bread auto-suggest or Collection/Delivery ─────
    if (buttonId === 'tov_checkout') {
      const conv = await getConversation(from);
      if (!conv.activeCart?.items?.length) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: '🛒 Your basket is empty! Type *Menu* to browse our dishes, or browse our catalog.' },
        });
        return;
      }

      // Psychology: Bread auto-suggest if cart has curry but no bread
      const itemIds = conv.activeCart.items.map(i => i.id);
      const hasCurry = itemIds.some(id => {
        const item = getMenuItemById(id);
        return item && isCurryItem(item);
      });

      if (hasCurry && !cartHasBread(itemIds)) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: '🫓 No bread in your order!' },
            body: {
              text: `Every curry deserves fresh naan from our tandoor.\n\n🛒 *Your order:*\n${cartSummaryText(conv.activeCart.items)}\n*Subtotal: ${formatPrice(conv.activeCart.basePence / 100)}*`,
            },
            action: {
              buttons: [
                { type: 'reply', reply: { id: 'tov_add_naan', title: '+ Naan £0.99' } },
                { type: 'reply', reply: { id: 'tov_add_garlic', title: '+ Garlic Naan £1.99' } },
                { type: 'reply', reply: { id: 'tov_skip_bread', title: 'No bread needed' } },
              ],
            },
          },
        });
        return;
      }

      // No bread needed or already has bread → go to fulfillment
      await sendFulfillmentChoice(phoneId, from, conv.activeCart);
      return;
    }

    // ── Meal Deal Upgrade → add naan + rice + drink in 1 tap ─────
    if (buttonId === 'tov_meal_deal') {
      const conv = await getConversation(from);
      let items = conv.activeCart?.items || [];
      for (const mealItem of MEAL_DEAL.items) {
        items = addToCart(items, {
          id: mealItem.id,
          name: mealItem.name,
          quantity: 1,
          pricePence: mealItem.pricePence,
        });
      }
      const total = cartTotal(items);

      await updateConversation(from, {
        activeCart: { items, basePence: total, updatedAt: new Date().toISOString() },
      });

      const progressBar = buildDeliveryProgressBar(total, 3000);

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: '🍽️ Meal Deal Added!' },
          body: {
            text: [
              `✅ Upgraded to a meal!`,
              `_${MEAL_DEAL.includes}_`,
              '',
              `🛒 *Your basket:*`,
              cartSummaryText(items),
              `*Total: ${formatPrice(total / 100)}*`,
              '',
              progressBar,
            ].join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'tov_checkout', title: '🛒 Checkout' } },
              { type: 'reply', reply: { id: 'tov_add_more', title: '📋 Add More' } },
              { type: 'reply', reply: { id: 'tov_clear_cart', title: '🗑️ Clear' } },
            ],
          },
        },
      });
      return;
    }

    // ── Bread quick-add buttons ──────────────────────────────────
    if (buttonId === 'tov_add_naan' || buttonId === 'tov_add_garlic') {
      const conv = await getConversation(from);
      const breadItem = buttonId === 'tov_add_naan'
        ? { id: 'naan', name: 'Naan', pricePence: 99 }
        : { id: 'garlic', name: 'Garlic Naan', pricePence: 199 };
      const newItems = addToCart(conv.activeCart?.items, { ...breadItem, quantity: 1 });
      const total = cartTotal(newItems);

      await updateConversation(from, {
        activeCart: { items: newItems, basePence: total, updatedAt: new Date().toISOString() },
      });

      await sendFulfillmentChoice(phoneId, from, { items: newItems, basePence: total });
      return;
    }

    // ── Skip bread → go straight to fulfillment ─────────────────
    if (buttonId === 'tov_skip_bread') {
      const conv = await getConversation(from);
      if (conv.activeCart?.items?.length) {
        await sendFulfillmentChoice(phoneId, from, conv.activeCart);
      }
      return;
    }

    // ── Add More → category list ─────────────────────────────────
    if (buttonId === 'tov_add_more' || buttonId === 'tov_menu') {
      await sendCategoryList(phoneId, from);
      return;
    }

    // ── Clear Cart ───────────────────────────────────────────────
    if (buttonId === 'tov_clear_cart') {
      await updateConversation(from, { activeCart: null, state: 'idle' });
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: '🗑️ Cart cleared. Type *Menu* to start a new order.' },
      });
      return;
    }

    // ── Collection → generate payment link ───────────────────────
    if (buttonId === 'tov_collection') {
      const conv = await getConversation(from);
      if (!conv.activeCart?.items?.length) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: '🛒 Your basket is empty! Type *Menu* to browse dishes.' },
        });
        return;
      }
      await generateCheckoutLink(phoneId, from, name, conv.activeCart, false, 0);
      return;
    }

    // ── Delivery → ask for postcode ──────────────────────────────
    if (buttonId === 'tov_delivery') {
      const conv = await getConversation(from);
      if (!conv.activeCart?.items?.length) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: '🛒 Your basket is empty! Type *Menu* to browse dishes.' },
        });
        return;
      }

      // Check minimum order (£15 for Hayes)
      if (conv.activeCart.basePence < LOC.delivery.minOrder * 100) {
        const shortBy = formatPrice(LOC.delivery.minOrder - conv.activeCart.basePence / 100);
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: {
            body: `⚠️ *Minimum delivery order: ${formatPrice(LOC.delivery.minOrder)}*\n\nYour basket is ${formatPrice(conv.activeCart.basePence / 100)}. You need ${shortBy} more.\n\nType *Menu* to add items, or select *Collection* below.`,
          },
        });
        return;
      }

      await updateConversation(from, { state: 'awaiting_postcode' });
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: {
          body: `📍 *Where should we deliver?*\n\nPlease send your postcode so we can check delivery to your area and calculate the fee.\n\n_Example: UB4 0RU_`,
        },
      });
      return;
    }
  }
}

async function handleOrderMessage(phoneId: string, from: string, name: string, message: any) {
  const orderItems: any[] = message.order?.product_items || [];
  if (!orderItems.length) return;

  const cartItems: CartItem[] = [];
  let totalPence = 0;

  for (const item of orderItems) {
    const menuItem = getMenuItemById(item.product_retailer_id);
    const pricePence = menuItem
      ? Math.round(menuItem.price * 100)
      : Math.round(parseFloat(item.item_price || '0') * 100);
    const qty = Number(item.quantity) || 1;
    const itemName = menuItem?.name || item.product_retailer_id;

    cartItems.push({ id: item.product_retailer_id, name: itemName, quantity: qty, pricePence });
    totalPence += pricePence * qty;
  }

  await updateConversation(from, {
    phone: from,
    name,
    timestamp: new Date().toISOString(),
    state: 'idle',
    activeCart: { items: cartItems, basePence: totalPence, updatedAt: new Date().toISOString() },
  });

  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'Order Received' },
      body: {
        text: `🛒 *Your cart:*\n${cartSummaryText(cartItems)}\n\n*Total: ${formatPrice(totalPence / 100)}*\n\nHow would you like this?`,
      },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
          { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } },
        ],
      },
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
// Sub-Handlers
// ══════════════════════════════════════════════════════════════════════

async function handlePostcodeInput(
  phoneId: string,
  from: string,
  name: string,
  rawText: string,
  conv: ConversationState
) {
  // Reset state regardless of outcome
  await updateConversation(from, { state: 'idle' });

  // Quick validation: does this look remotely like a UK postcode?
  const cleaned = rawText.trim().toUpperCase();
  if (cleaned.length < 3 || cleaned.length > 10) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '❌ That doesn\'t look like a valid UK postcode. Please try again (e.g., *UB4 0RU*) or type *Menu* to start over.' },
    });
    return;
  }

  // Geocode via Postcodes.io (free, no API key)
  const geo = await geocodePostcode(cleaned);

  if (!geo.valid || !geo.lat || !geo.lng) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: `❌ We couldn't find postcode *${cleaned}*. Please check and resend, or type *Collection* to pick up instead.` },
    });
    return;
  }

  // Calculate distance and delivery fee using shopConfig tiers
  const miles = haversineDistanceMiles(LOC.coords.lat, LOC.coords.lng, geo.lat, geo.lng);
  const tier = getDeliveryFeeByDistance(miles, BRANCH_ID);

  if (!tier.eligible) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: `📍 *${geo.formatted}* is ${miles.toFixed(1)} miles away.\n\n${tier.reason || `Our delivery radius is ${LOC.delivery.maxRadiusMiles} miles.`}\n\nWould you like to collect instead?`,
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
          ],
        },
      },
    });
    return;
  }

  // Check if order qualifies for free delivery
  const cart = conv.activeCart;
  if (!cart?.items?.length) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '🛒 Your basket is empty! Type *Menu* to browse.' },
    });
    return;
  }

  const subtotalPounds = cart.basePence / 100;
  const isFree = subtotalPounds >= tier.freeThreshold;
  const deliveryFeePence = isFree ? 0 : Math.round(tier.fee * 100);

  // Store delivery quote and prompt for building/street address
  await updateConversation(from, {
    state: 'awaiting_address',
    pendingDelivery: {
      postcode: geo.formatted,
      miles,
      deliveryFeePence,
    },
  });

  const feeDesc = deliveryFeePence === 0 ? '*FREE* 🎉' : formatPrice(deliveryFeePence / 100);
  await sendWhatsAppMessage(phoneId, from, {
    type: 'text',
    text: {
      body: [
        `✅ *Postcode confirmed:* ${geo.formatted} (${miles.toFixed(1)} miles)`,
        `🚗 Delivery: ${feeDesc} • Est. 35–45 mins`,
        ``,
        `🏠 *What is your street address?*`,
        `Please send your building/flat number and street name:`,
        `_(e.g., 14 High Street, Flat 2B)_`,
      ].join('\n'),
    },
  });
}

async function handleAddressInput(
  phoneId: string,
  from: string,
  name: string,
  rawText: string,
  conv: ConversationState
) {
  const streetAddress = rawText.trim();
  const pending = conv.pendingDelivery;
  const cart = conv.activeCart;

  if (!cart?.items?.length) {
    await updateConversation(from, { state: 'idle', pendingDelivery: null });
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '🛒 Your basket is empty! Type *Menu* to browse dishes.' },
    });
    return;
  }

  if (streetAddress.length < 3) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: 'Please reply with your building/flat number and street name (e.g., *14 High Street*):' },
    });
    return;
  }

  const deliveryFeePence = pending?.deliveryFeePence || 0;
  const postcode = pending?.postcode || '';

  await generateCheckoutLink(
    phoneId,
    from,
    name,
    cart,
    true,
    deliveryFeePence,
    postcode,
    streetAddress
  );
}

async function generateCheckoutLink(
  phoneId: string,
  from: string,
  name: string,
  cart: { items: CartItem[]; basePence: number },
  isDelivery: boolean,
  deliveryFeePence: number,
  postcode?: string,
  streetAddress?: string
) {
  const items: CheckoutLineItem[] = cart.items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    pricePence: i.pricePence,
  }));

  const { url: squareLink, orderId, referenceId } = await createItemisedCheckoutLink({
    branchId: BRANCH_ID,
    items,
    isDelivery,
    deliveryFeePence,
    customerName: name,
    customerPhone: from,
    postcode,
    streetAddress,
  });

  const totalPence = cart.basePence + deliveryFeePence;

  // Store order-to-phone mapping for post-payment WhatsApp confirmation
  const orderRecord = {
    orderId: orderId || referenceId,
    referenceId,
    phone: from,
    phoneId,
    name,
    items: cart.items,
    fulfillmentType: isDelivery ? 'delivery' : 'collection',
    status: 'payment_pending',
    paymentLinkUrl: squareLink,
    postcode: postcode || null,
    streetAddress: streetAddress || null,
    totalPence,
    createdAt: new Date().toISOString(),
  };

  try {
    if (referenceId) {
      await adminDb.collection('whatsapp_orders').doc(referenceId).set(orderRecord);
    }
    if (orderId && orderId !== referenceId) {
      await adminDb.collection('whatsapp_orders').doc(orderId).set(orderRecord);
    }
  } catch (e) {
    // NEVER block payment link delivery — log and continue
    console.error('[TOV WABA] Failed to save whatsapp_orders:', e);
  }

  if (!squareLink) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '⚠️ Our checkout is temporarily updating. Please try again in a minute.' },
    });
    return;
  }

  // Preserve the active cart so it survives until payment is completed!
  await updateConversation(from, {
    state: 'idle',
    pendingDelivery: null,
    activeCart: {
      ...cart,
      checkoutLink: squareLink,
      checkoutOrderId: orderId || referenceId,
      checkoutReferenceId: referenceId,
      checkoutAt: new Date().toISOString(),
    },
  });

  if (isDelivery) {
    const feeText = deliveryFeePence === 0 ? '*FREE* 🎉' : formatPrice(deliveryFeePence / 100);
    const est = LOC.delivery.estimatedMinutes.delivery;
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          '🛵 *Delivery Order Summary*',
          '',
          `📋 *Items:*`,
          cartSummaryText(cart.items),
          '',
          `Subtotal: ${formatPrice(cart.basePence / 100)}`,
          `Delivery: ${feeText}`,
          `*Total: ${formatPrice(totalPence / 100)}*`,
          streetAddress ? `📍 ${streetAddress}, ${postcode}` : (postcode ? `📍 ${postcode}` : ''),
          `⏱️ Est. ${est.min}–${est.max} mins`,
          '',
          `💳 Pay securely via Apple Pay / Google Pay / Card:`,
          squareLink,
          '',
          `_Your basket remains saved until payment completes._`,
        ].filter(Boolean).join('\n'),
      },
    });
  } else {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          '🏪 *Collection Order Summary*',
          '',
          `📋 *Items:*`,
          cartSummaryText(cart.items),
          '',
          `*Total: ${formatPrice(totalPence / 100)}*`,
          '',
          `📍 Pickup at: *${LOC.address}, ${LOC.city} ${LOC.postcode}*`,
          '',
          `💳 Pay securely via Apple Pay / Google Pay / Card:`,
          squareLink,
          '',
          `_Your basket remains saved until payment completes._`,
        ].filter(Boolean).join('\n'),
      },
    });
  }
}

async function sendFulfillmentChoice(
  phoneId: string,
  from: string,
  cart: { items: CartItem[]; basePence: number }
) {
  const progressBar = buildDeliveryProgressBar(cart.basePence, 3000);

  // Bridge items: suggest low-cost impulse adds if below free delivery threshold
  let bridgeText = '';
  if (cart.basePence < 3000) {
    const gap = 3000 - cart.basePence;
    const suggestions = BRIDGE_ITEMS
      .filter(b => b.pricePence <= gap + 200) // slightly above gap is fine
      .slice(0, 2)
      .map(b => `${b.emoji} ${b.name} (${formatPrice(b.pricePence / 100)})`)
      .join(' • ');
    if (suggestions) {
      bridgeText = `\n💡 _Popular add-ons: ${suggestions}_`;
    }
  }

  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'How would you like your order?' },
      body: {
        text: [
          `🛒 *Your order:*`,
          cartSummaryText(cart.items),
          '',
          `*Subtotal: ${formatPrice(cart.basePence / 100)}*`,
          '',
          progressBar,
          bridgeText,
          '',
          'Select your fulfillment:',
        ].filter(Boolean).join('\n'),
      },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
          { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } },
        ],
      },
    },
  });
}

async function sendWelcome(phoneId: string, from: string, name: string, conv?: ConversationState) {
  const hour = new Date().getUTCHours();
  let timeGreeting = 'Hello';
  if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else timeGreeting = 'Good evening';

  const cleanName = name && name !== from ? `, ${name}` : '';
  const hasCart = conv?.activeCart?.items?.length;
  const checkoutLink = conv?.activeCart?.checkoutLink;

  let cartSection = '';
  if (hasCart) {
    cartSection = `\n\n🛒 *Your Basket:* ${conv!.activeCart!.items.length} item(s) (${formatPrice(conv!.activeCart!.basePence / 100)})`;
    if (checkoutLink) {
      cartSection += `\n💳 *Payment Link Ready:* ${checkoutLink}`;
    }
  }

  const fastMenuUrl = `https://tasteofvillagerestaurants.co.uk/${BRANCH_ID}/order?phone=${from}`;

  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'Taste of Village Hayes' },
      body: {
        text: [
          `👋 *${timeGreeting}${cleanName}!* Welcome to Taste of Village.`,
          cartSection,
          ``,
          `✨ *Two easy ways to order:*`,
          `📸 *Fast Photo Menu & 1-Tap Pay:*`,
          fastMenuUrl,
          ``,
          `Or tap *Browse Menu* below to order directly in chat! 👇`,
        ].filter(Boolean).join('\n'),
      },
      action: {
        buttons: hasCart
          ? [
              { type: 'reply', reply: { id: 'tov_checkout', title: '🛒 Checkout' } },
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Menu' } },
            ]
          : [
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
            ],
      },
    },
  });
}

async function sendCategoryList(phoneId: string, from: string) {
  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: 'Taste of Village Menu' },
      body: { text: 'Pick a category to browse dishes:' },
      footer: { text: 'Authentic Pakistani & Indian Cuisine' },
      action: {
        button: '📋 Browse Menu',
        sections: buildMenuCategorySections(),
      },
    },
  });
}
