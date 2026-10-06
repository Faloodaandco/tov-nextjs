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
  state: 'idle' | 'awaiting_postcode';
  activeCart?: { items: CartItem[]; basePence: number; updatedAt: string };
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
      activeCart: data?.activeCart || undefined,
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

  // ── Intent: menu / food / order ────────────────────────────────
  if (/\b(menu|food|order|browse|dishes|eat)\b/.test(text)) {
    await sendCategoryList(phoneId, from);
    return;
  }

  // ── Intent: I paid ─────────────────────────────────────────────
  if (/\b(i paid|payment done|just paid|paid already)\b/.test(text)) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        body: '✅ Thank you! If your payment is confirmed, your order will appear on our kitchen screen shortly.\n\nIf there are any issues, our team will contact you on this number.',
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

    // Item selected → add to cart
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

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: `Added: ${menuItem.name}` },
          body: {
            text: `✅ *${menuItem.name}* (${formatPrice(menuItem.price)}) added!\n\n🛒 *Your basket:*\n${cartSummaryText(newItems)}\n\n*Total: ${formatPrice(total / 100)}*`,
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
    return;
  }

  if (replyType === 'button_reply') {
    const buttonId: string = message.interactive.button_reply.id;

    // ── Checkout → ask Collection/Delivery ───────────────────────
    if (buttonId === 'tov_checkout') {
      const conv = await getConversation(from);
      if (!conv.activeCart?.items?.length) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: '🛒 Your basket is empty! Type *Menu* to browse our dishes, or browse our catalog.' },
        });
        return;
      }

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'How would you like your order?' },
          body: {
            text: `🛒 *Your order:*\n${cartSummaryText(conv.activeCart.items)}\n\n*Subtotal: ${formatPrice(conv.activeCart.basePence / 100)}*\n\nSelect your fulfillment:`,
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
              { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } },
            ],
          },
        },
      });
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

  // Generate payment link with delivery fee (includes delivery details in the message)
  await generateCheckoutLink(phoneId, from, name, cart, true, deliveryFeePence, geo.formatted);
}

async function generateCheckoutLink(
  phoneId: string,
  from: string,
  name: string,
  cart: { items: CartItem[]; basePence: number },
  isDelivery: boolean,
  deliveryFeePence: number,
  postcode?: string
) {
  const items: CheckoutLineItem[] = cart.items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    pricePence: i.pricePence,
  }));

  const { url: squareLink, orderId } = await createItemisedCheckoutLink({
    branchId: BRANCH_ID,
    items,
    isDelivery,
    deliveryFeePence,
    customerName: name,
  });

  // Store order-to-phone mapping for post-payment WhatsApp confirmation
  if (orderId) {
    try {
      await adminDb.collection('whatsapp_orders').doc(orderId).set({
        phone: from,
        name,
        items: cart.items,
        fulfillmentType: isDelivery ? 'delivery' : 'collection',
        status: 'payment_pending',
        paymentLinkUrl: squareLink,
        postcode: postcode || null,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      // NEVER block payment link delivery — log and continue
      console.error('[TOV WABA] Failed to save whatsapp_orders:', e);
    }
  }

  if (!squareLink) {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '⚠️ Our checkout is temporarily updating. Please try again in a minute.' },
    });
    return;
  }

  // Clear the cart after generating payment link
  await updateConversation(from, { activeCart: null, state: 'idle' });

  const totalPence = cart.basePence + deliveryFeePence;

  if (isDelivery) {
    const feeText = deliveryFeePence === 0 ? '*FREE* 🎉' : formatPrice(deliveryFeePence / 100);
    const est = LOC.delivery.estimatedMinutes.delivery;
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          '🛵 *Delivery Order*',
          '',
          `📋 *Items:*`,
          cartSummaryText(cart.items),
          '',
          `Subtotal: ${formatPrice(cart.basePence / 100)}`,
          `Delivery: ${feeText}`,
          `*Total: ${formatPrice(totalPence / 100)}*`,
          postcode ? `📍 ${postcode}` : '',
          `⏱️ Est. ${est.min}–${est.max} mins`,
          '',
          `💳 Pay securely via Apple Pay / Google Pay:`,
          squareLink,
        ].filter(Boolean).join('\n'),
      },
    });
  } else {
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          '🏪 *Collection Order*',
          '',
          `📋 *Items:*`,
          cartSummaryText(cart.items),
          '',
          `*Total: ${formatPrice(totalPence / 100)}*`,
          '',
          `📍 Pickup at: *${LOC.address}, ${LOC.city} ${LOC.postcode}*`,
          '',
          `💳 Pay securely:`,
          squareLink,
        ].join('\n'),
      },
    });
  }
}

async function sendWelcome(phoneId: string, from: string, name: string, conv?: ConversationState) {
  const hasCart = conv?.activeCart?.items?.length;
  const cartLine = hasCart
    ? `\n\n🛒 You have ${conv!.activeCart!.items.length} item(s) in your basket (${formatPrice(conv!.activeCart!.basePence / 100)}).`
    : '';

  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: `👋 Welcome to *${LOC.name}*!${cartLine}\n\nBrowse our menu below, or use our catalog to build your order.`,
      },
      action: {
        buttons: hasCart
          ? [
              { type: 'reply', reply: { id: 'tov_checkout', title: '🛒 Checkout' } },
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Menu' } },
            ]
          : [
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 View Menu' } },
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
