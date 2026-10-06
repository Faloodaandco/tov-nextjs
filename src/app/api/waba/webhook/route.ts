import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendWhatsAppMessage } from '@/lib/waba';
import { createItemisedCheckoutLink, createQuickPayFallbackLink, verifySquareOrderPayment, type CheckoutLineItem } from '@/lib/square';
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
  findMatchingCategory,
  searchMenuDishes,
  getCuratedDish,
} from '@/lib/wabaMenu';
import {
  LOCATIONS,
  type LocationId,
  haversineDistanceMiles,
  getDeliveryFeeByDistance,
} from '@/config/shopConfig';
import { analyzeWithGemini } from '@/lib/geminiAssistant';

// ── Types ────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  pricePence: number;
}

interface ConversationState {
  state: 'idle' | 'awaiting_postcode' | 'awaiting_address' | 'awaiting_branch';
  branchId?: LocationId;
  pendingDelivery?: {
    branchId?: LocationId;
    postcode: string;
    miles: number;
    deliveryFeePence: number;
  };
  activeCart?: {
    branchId?: LocationId;
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

// ── Branch & Location Resolution ─────────────────────────────────────
const DEFAULT_BRANCH_ID: LocationId = 'hayes';

function getEffectiveBranch(conv?: ConversationState): LocationId {
  if (conv?.branchId && (conv.branchId === 'hayes' || conv.branchId === 'slough')) {
    return conv.branchId;
  }
  if (conv?.pendingDelivery?.branchId && (conv.pendingDelivery.branchId === 'hayes' || conv.pendingDelivery.branchId === 'slough')) {
    return conv.pendingDelivery.branchId;
  }
  if (conv?.activeCart?.branchId && (conv.activeCart.branchId === 'hayes' || conv.activeCart.branchId === 'slough')) {
    return conv.activeCart.branchId;
  }
  return DEFAULT_BRANCH_ID;
}

function getLocationConfig(branchId: LocationId = DEFAULT_BRANCH_ID) {
  return LOCATIONS[branchId] || LOCATIONS.hayes;
}

// ── In-Memory Session Cache (Fast & Resilient even if Firestore credentials fail) ──
const CONVERSATION_CACHE = new Map<string, { state: ConversationState; updatedAt: number }>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

async function getConversation(phone: string): Promise<ConversationState> {
  const cached = CONVERSATION_CACHE.get(phone);
  if (cached && (Date.now() - cached.updatedAt < CACHE_TTL_MS) && cached.state.activeCart?.items?.length) {
    return cached.state;
  }

  try {
    const fetchPromise = adminDb.collection('whatsapp_conversations').doc(phone).get();
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 250));
    const snap = await Promise.race([fetchPromise, timeoutPromise]);
    if (snap && typeof (snap as any).data === 'function') {
      const data = (snap as any).data();
      const state: ConversationState = {
        state: data?.state || cached?.state?.state || 'idle',
        branchId: (data?.branchId as LocationId) || cached?.state?.branchId || undefined,
        pendingDelivery: data?.pendingDelivery || cached?.state?.pendingDelivery || undefined,
        activeCart: data?.activeCart || cached?.state?.activeCart || undefined,
        lastPaidOrderId: data?.lastPaidOrderId || cached?.state?.lastPaidOrderId || undefined,
        lastPaidAt: data?.lastPaidAt || cached?.state?.lastPaidAt || undefined,
      };
      CONVERSATION_CACHE.set(phone, { state, updatedAt: Date.now() });
      return state;
    }
  } catch (err) {
    // Non-blocking fallback to memory session
  }
  return cached?.state || { state: 'idle' };
}

async function updateConversation(phone: string, updates: Record<string, unknown>) {
  // Update in-memory session immediately so cart and delivery details survive
  const existing = CONVERSATION_CACHE.get(phone)?.state || { state: 'idle' };
  const merged: ConversationState = {
    ...existing,
    ...(updates.state ? { state: updates.state as any } : {}),
    ...(updates.branchId ? { branchId: updates.branchId as LocationId } : {}),
    ...(updates.pendingDelivery !== undefined ? { pendingDelivery: updates.pendingDelivery as any } : {}),
    ...(updates.activeCart !== undefined ? { activeCart: updates.activeCart as any } : {}),
    ...(updates.lastPaidOrderId ? { lastPaidOrderId: updates.lastPaidOrderId as any } : {}),
    ...(updates.lastPaidAt ? { lastPaidAt: updates.lastPaidAt as any } : {}),
  };
  CONVERSATION_CACHE.set(phone, { state: merged, updatedAt: Date.now() });

  // Asynchronously attempt to sync to Firestore in background (NEVER block response)
  adminDb.collection('whatsapp_conversations').doc(phone).set(updates, { merge: true }).catch(() => {});
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

const TOV_PREFIX = 'tov_item_1777480501499_';

// Cache for catalog items that don't match tov-menu.json IDs (e.g. Facebook Commerce Catalog)
// Populated by handleOrderMessage so decodeCart can recover name/price for non-menu IDs.
const CATALOG_ITEM_CACHE = new Map<string, { name: string; pricePence: number }>();

function encodeCart(items: CartItem[]): string {
  if (!items?.length) return '';
  return items.map(i => {
    const cleanId = i.id.startsWith(TOV_PREFIX) ? i.id.slice(TOV_PREFIX.length) : i.id;
    return `${cleanId}:${i.quantity}:${i.pricePence}`;
  }).join(',').slice(0, 200);
}

function decodeCart(str: string): CartItem[] {
  if (!str) return [];
  const parts = str.split(',');
  const items: CartItem[] = [];
  for (const part of parts) {
    const segments = part.split(':');
    const rawId = segments[0];
    const qtyStr = segments[1];
    const pricePenceStr = segments[2]; // Embedded price fallback
    if (!rawId) continue;
    const fullId = rawId.startsWith('tov_item_') ? rawId : `${TOV_PREFIX}${rawId}`;
    const item = getMenuItemById(fullId) || getMenuItemById(rawId);
    const quantity = Math.max(1, parseInt(qtyStr || '1', 10) || 1);
    if (item) {
      items.push({
        id: item.id,
        name: item.name,
        quantity,
        pricePence: Math.round(item.price * 100),
      });
    } else {
      // Preserve items not in local menu (native catalog orders, custom items)
      const cached = CATALOG_ITEM_CACHE.get(rawId) || CATALOG_ITEM_CACHE.get(fullId);
      const fallbackPrice = parseInt(pricePenceStr || '0', 10) || cached?.pricePence || 0;
      const fallbackName = cached?.name || rawId;
      if (fallbackPrice > 0) {
        items.push({
          id: fullId,
          name: fallbackName,
          quantity,
          pricePence: fallbackPrice,
        });
      }
    }
  }
  return items;
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

// ── In-Memory Fast Dedup Cache (0ms latency) ────────────────────────
const SEEN_MESSAGE_IDS = new Set<string>();

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
          // ── Fast In-Memory Deduplication (0ms) ───────────────────
          if (SEEN_MESSAGE_IDS.has(message.id)) {
            continue;
          }
          SEEN_MESSAGE_IDS.add(message.id);
          if (SEEN_MESSAGE_IDS.size > 2000) {
            const first = SEEN_MESSAGE_IDS.values().next().value;
            if (first) SEEN_MESSAGE_IDS.delete(first);
          }

          // Asynchronously persist to Firestore without blocking response
          adminDb.collection('webhook_dedup').doc(`tov_${message.id}`).set({
            messageId: message.id,
            processedAt: new Date().toISOString(),
            expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }).catch(() => {});

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
  // Read conversation state immediately
  const conv = await getConversation(from);
  const text = rawText.toLowerCase().trim();

  // Log conversation in background without blocking response
  updateConversation(from, {
    phone: from,
    name,
    lastMessage: rawText,
    timestamp: new Date().toISOString(),
  }).catch(() => {});

  // ── Dynamic Branch Intent Detection (e.g. Slough vs Hayes, GBP pre-filled links) ──
  const isExplicitSlough = /\b(slough|farnham)\b/i.test(text);
  const isExplicitHayes = /\b(hayes|uxbridge)\b/i.test(text);

  if (isExplicitSlough && !isExplicitHayes) {
    conv.branchId = 'slough';
    if (conv.activeCart) conv.activeCart.branchId = 'slough';
    await updateConversation(from, { branchId: 'slough' });
  } else if (isExplicitHayes && !isExplicitSlough) {
    conv.branchId = 'hayes';
    if (conv.activeCart) conv.activeCart.branchId = 'hayes';
    await updateConversation(from, { branchId: 'hayes' });
  }

  // Branch switcher command
  if (/^(switch|change|choose|select)\s*(branch|location)$/i.test(text) || text === 'branch' || text === 'branches') {
    await sendBranchSelector(phoneId, from, conv);
    return;
  }

  // Pure branch greeting/selection text (e.g. user just texts "Slough", "Hayes", or GBP click-to-chat prefill)
  if (/^(slough|hayes)(\s*(branch|restaurant|location|please))?$/i.test(text) || /^(i\s*(want|would like)\s*to\s*order\s*from\s*(slough|hayes))\b/i.test(text)) {
    const activeBranch = getEffectiveBranch(conv);
    const loc = LOCATIONS[activeBranch];
    await sendWhatsAppMessage(phoneId, from, {
      type: 'interactive',
      interactive: {
        type: 'button',
        header: { type: 'text', text: loc.name },
        body: {
          text: [
            `📍 *${loc.name}* is selected!`,
            `${loc.address}, ${loc.city} ${loc.postcode}`,
            `📞 ${loc.phone}`,
            ``,
            `🕐 Open daily: 10:00 AM – 02:00 AM midnight`,
            ``,
            `What would you like to order today?`,
          ].join('\n'),
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
            { type: 'reply', reply: { id: 'tov_choose_branch', title: '🔄 Switch Branch' } },
          ],
        },
      },
    });
    return;
  }

  // ── State: awaiting delivery address or postcode ──────────────
  if (conv.state === 'awaiting_postcode' || conv.state === 'awaiting_address') {
    await handleAddressInput(phoneId, from, name, rawText, conv);
    return;
  }

  // ── Intent: Greetings (Hi, Hello, Hey, Salam, etc.) ───────────
  if (/^(hi|hello|hey|hiya|salam|assalam|yo|hlo|good\s*(morning|afternoon|evening))\b/i.test(text)) {
    await sendWelcome(phoneId, from, name, conv);
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

  // ── Intent: Direct Text "Collection" / "Delivery" ──────────────
  if (/^(collection|pickup|pick up)\b/i.test(text)) {
    const branchId = getEffectiveBranch(conv);
    if (conv.activeCart?.items?.length) {
      await generateCheckoutLink(phoneId, from, name, conv.activeCart, false, 0, undefined, undefined, branchId);
      return;
    } else {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: `To place a collection order from Taste of Village (${LOCATIONS[branchId].city}), please choose your dishes from our menu below 👇` },
      });
      await sendCategoryList(phoneId, from);
      return;
    }
  }

  if (/^(delivery|deliver)\b/i.test(text)) {
    if (conv.activeCart?.items?.length) {
      await updateConversation(from, { state: 'awaiting_postcode' });
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: '🛵 Please reply with your delivery postcode or address (e.g. *14 High Street, UB4 0RU* or *SL1 4NL*) so we can calculate delivery distance and fee:' },
      });
      return;
    } else {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: 'To place a delivery order, please choose your dishes from our menu below 👇' },
      });
      await sendCategoryList(phoneId, from);
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
  if (/^(menu|food|order|browse|dishes|eat)$/i.test(text)) {
    const carriedCartStr = conv.activeCart?.items?.length ? encodeCart(conv.activeCart.items) : '';
    await sendCategoryList(phoneId, from, carriedCartStr);
    return;
  }

  // ── Intelligent Gemini Assistant (Multi-dish order, recommendations, FAQs) ──
  const aiResult = await analyzeWithGemini(rawText);
  if (aiResult) {
    if (aiResult.intent === 'order' && aiResult.orderItems.length > 0) {
      let currentItems = conv.activeCart?.items || [];
      for (const ordItem of aiResult.orderItems) {
        currentItems = addToCart(currentItems, ordItem);
      }
      const total = cartTotal(currentItems);

      await updateConversation(from, {
        activeCart: { items: currentItems, basePence: total, updatedAt: new Date().toISOString() },
        state: 'idle',
      });

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'Order Updated' },
          body: {
            text: [
              `✅ ${aiResult.reply || 'Added to your order!'}`,
              '',
              `🛒 *Your Basket:*`,
              cartSummaryText(currentItems),
              `*Total: ${formatPrice(total / 100)}*`,
              '',
              'Ready to checkout?',
            ].join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_col_${encodeCart(currentItems)}`, title: '🏪 Collection' } },
              { type: 'reply', reply: { id: `tov_del_${encodeCart(currentItems)}`, title: '🛵 Delivery' } },
              { type: 'reply', reply: { id: `tov_more_${encodeCart(currentItems)}`, title: '➕ Add More' } },
            ],
          },
        },
      });
      return;
    }

    if (aiResult.intent === 'recommendation' && aiResult.suggestedDish) {
      const sug = aiResult.suggestedDish;
      const sugCart = addToCart(conv.activeCart?.items, {
        id: sug.id,
        name: sug.name,
        quantity: 1,
        pricePence: Math.round(sug.price * 100),
      });

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: sug.name.slice(0, 60) },
          body: {
            text: [
              aiResult.reply,
              '',
              `⭐ *${sug.name}* (${formatPrice(sug.price)})`,
              sug.description ? `_${sug.description.slice(0, 80)}_` : '',
            ].filter(Boolean).join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_add_${encodeCart(sugCart)}`, title: `➕ Add (${formatPrice(sug.price)})` } },
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
            ],
          },
        },
      });
      return;
    }

    if (aiResult.intent === 'faq') {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: aiResult.reply },
          action: {
            buttons: [
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
            ],
          },
        },
      });
      return;
    }
  }

  // ── Smart Curation: Fast-close on popular dishes (e.g. "I biryani", "karahi", "grill") ──
  const activeBranch = getEffectiveBranch(conv);
  const loc = LOCATIONS[activeBranch];
  const curated = getCuratedDish(text, activeBranch);
  if (curated) {
    const newItems = addToCart(conv.activeCart?.items, {
      id: curated.item.id,
      name: curated.item.name,
      quantity: 1,
      pricePence: Math.round(curated.item.price * 100),
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
        header: { type: 'text', text: curated.item.name.slice(0, 60) },
        body: {
          text: [
            `✅ *${curated.item.name}* (${formatPrice(curated.item.price)}) in your basket!`,
            curated.item.description ? `_${curated.item.description.slice(0, 80)}_` : '',
            '',
            `🛒 *Order Total: ${formatPrice(total / 100)}*`,
            '',
            'Ready to close your order?',
          ].filter(Boolean).join('\n'),
        },
        action: {
          buttons: [
            { type: 'reply', reply: { id: `tov_col_${encodeCart(newItems)}`, title: '🏪 Collection' } },
            { type: 'reply', reply: { id: `tov_del_${encodeCart(newItems)}`, title: '🛵 Delivery' } },
            { type: 'reply', reply: { id: `tov_more_${encodeCart(newItems)}`, title: '➕ Add More' } },
          ],
        },
      },
    });
    return;
  }

  // ── Intent: Smart Category Match (e.g., "biryani", "karahi", "kebab", "naan") ──
  const matchedCategory = findMatchingCategory(text, activeBranch);
  if (matchedCategory) {
    const carriedCartStr = conv.activeCart?.items?.length ? encodeCart(conv.activeCart.items) : '';
    const rows = buildItemListRows(matchedCategory.id, carriedCartStr, activeBranch);
    if (rows.length > 0) {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: matchedCategory.title },
          body: { text: `Here are our freshly cooked ${matchedCategory.title} options. Tap any dish to add it to your order:` },
          footer: { text: `Taste of Village ${loc.city}` },
          action: {
            button: 'Select Dish',
            sections: [{ title: matchedCategory.title, rows }],
          },
        },
      });
      return;
    }
  }

  // ── Intent: Dish Keyword Search (e.g., "chicken tikka", "paneer", "lamb chops") ──
  const matchingDishes = searchMenuDishes(text, activeBranch);
  if (matchingDishes.length > 0) {
    const carriedCartStr = conv.activeCart?.items?.length ? encodeCart(conv.activeCart.items) : '';
    const carriedSuffix = carriedCartStr ? `~${carriedCartStr}` : '';
    const rows = matchingDishes.map(d => ({
      id: `${d.id}${carriedSuffix}`.slice(0, 200),
      title: d.name.slice(0, 24),
      description: `${formatPrice(d.price)} • Tap to add`.slice(0, 72),
    }));

    await sendWhatsAppMessage(phoneId, from, {
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: 'Dishes Found' },
        body: { text: `We found ${matchingDishes.length} dish(es) matching "${rawText.slice(0, 20)}". Tap an item to add it:` },
        footer: { text: `Taste of Village ${loc.city}` },
        action: {
          button: 'View Dishes',
          sections: [{ title: 'Matching Dishes', rows }],
        },
      },
    });
    return;
  }

  // ── Intent: I paid / Check Payment ─────────────────────────────
  if (/\b(i paid|payment done|just paid|paid already|confirm payment)\b/.test(text)) {
    const activeRef = conv.activeCart?.checkoutReferenceId || conv.activeCart?.checkoutOrderId;
    if (activeRef) {
      try {
        const orderSnap = await adminDb.collection('whatsapp_orders').doc(activeRef).get();
        if (orderSnap.exists) {
          const orderData = orderSnap.data();
          let isPaid = orderData?.status === 'PAID';

          // If not marked paid in Firestore, check Square Orders API directly
          if (!isPaid && orderData?.orderId && orderData?.branchId) {
            isPaid = await verifySquareOrderPayment(orderData.orderId, orderData.branchId as LocationId);
            if (isPaid) {
              await adminDb.collection('whatsapp_orders').doc(activeRef).update({ status: 'PAID' });
            }
          }

          if (isPaid) {
            await sendWhatsAppMessage(phoneId, from, {
              type: 'text',
              text: {
                body: `✅ *Payment Verified!* Your order #${activeRef} has been received and confirmed by the kitchen. Fresh food is being prepared right now! 👨‍🍳🔥`,
              },
            });
            // Clear cart upon successful manual verification
            await updateConversation(from, {
              activeCart: null,
              state: 'idle',
              lastPaidOrderId: activeRef,
              lastPaidAt: new Date().toISOString(),
            });
            return;
          } else if (orderData?.paymentLinkUrl) {
            await sendWhatsAppMessage(phoneId, from, {
              type: 'text',
              text: {
                body: `❌ We haven't received your payment yet. Please complete it using your link:\n${orderData.paymentLinkUrl}`,
              },
            });
            return;
          }
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
    const hayesLoc = LOCATIONS.hayes;
    const sloughLoc = LOCATIONS.slough;
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          `📍 *Taste of Village Branches:*`,
          ``,
          `🏪 *${hayesLoc.name}*`,
          `${hayesLoc.address}, ${hayesLoc.city} ${hayesLoc.postcode}`,
          `📞 ${hayesLoc.phone}`,
          ``,
          `🏪 *${sloughLoc.name}*`,
          `${sloughLoc.address}, ${sloughLoc.city} ${sloughLoc.postcode}`,
          `📞 ${sloughLoc.phone}`,
          ``,
          `🕐 *Opening Hours:* 10:00 AM – 02:00 AM daily (7 days)`,
          `Active branch: *${loc.name}*`,
          ``,
          `To switch branch, type *Slough* or *Hayes*, or type *Menu* to order!`,
        ].join('\n'),
      },
    });
    return;
  }

  // ── Default: Welcome ───────────────────────────────────────────
  await sendWelcome(phoneId, from, name, conv);
}

async function handleInteractiveMessage(phoneId: string, from: string, name: string, message: any) {
  const replyType = message.interactive.type;
  const conv = await getConversation(from);
  const activeBranch = getEffectiveBranch(conv);
  const loc = LOCATIONS[activeBranch];

  if (replyType === 'list_reply') {
    const rawListId: string = message.interactive.list_reply.id;
    const [listId, carriedCart] = rawListId.split('~');

    // Category selected → show items
    if (listId.startsWith('cat_')) {
      const rows = buildItemListRows(listId, carriedCart, activeBranch);
      if (rows.length > 0) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'list',
            header: { type: 'text', text: getSectionTitle(listId, activeBranch) },
            body: { text: 'Tap an item to add it to your order:' },
            footer: { text: `Taste of Village ${loc.city}` },
            action: {
              button: 'Select Item',
              sections: [{ title: getSectionTitle(listId, activeBranch), rows }],
            },
          },
        });
        return;
      }
    }

    // Item selected → add to cart and offer immediate close options
    const menuItem = getMenuItemById(listId, activeBranch);
    if (menuItem) {
      const carriedItems = decodeCart(carriedCart || '');
      const existingItems = carriedItems.length ? carriedItems : (conv.activeCart?.items || []);
      const newItems = addToCart(existingItems, {
        id: menuItem.id,
        name: menuItem.name,
        quantity: 1,
        pricePence: Math.round(menuItem.price * 100),
      });
      const total = cartTotal(newItems);

      await updateConversation(from, {
        activeCart: { items: newItems, basePence: total, branchId: activeBranch, updatedAt: new Date().toISOString() },
        state: 'idle',
      });

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: menuItem.name.slice(0, 60) },
          body: {
            text: [
              `✅ *${menuItem.name}* (${formatPrice(menuItem.price)}) in your basket!`,
              '',
              `🛒 *Your Order:*`,
              cartSummaryText(newItems),
              `*Total: ${formatPrice(total / 100)}*`,
              '',
              'Ready to checkout?',
            ].join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_col_${encodeCart(newItems)}`, title: '🏪 Collection' } },
              { type: 'reply', reply: { id: `tov_del_${encodeCart(newItems)}`, title: '🛵 Delivery' } },
              { type: 'reply', reply: { id: `tov_more_${encodeCart(newItems)}`, title: '➕ Add More' } },
            ],
          },
        },
      });
      return;
    }
    return;
  }

  if (replyType === 'button_reply') {
    const buttonId: string = message.interactive.button_reply.id;

    // ── Branch Switching Buttons ─────────────────────────────────
    if (buttonId === 'tov_choose_branch') {
      await sendBranchSelector(phoneId, from, conv);
      return;
    }

    if (buttonId === 'tov_branch_hayes' || buttonId === 'tov_branch_slough') {
      const selectedBranch: LocationId = buttonId === 'tov_branch_slough' ? 'slough' : 'hayes';
      const branchLoc = LOCATIONS[selectedBranch];
      await updateConversation(from, { branchId: selectedBranch });
      conv.branchId = selectedBranch;
      if (conv.activeCart) {
        conv.activeCart.branchId = selectedBranch;
        await updateConversation(from, { activeCart: conv.activeCart });
      }

      const carriedCartStr = conv.activeCart?.items?.length ? encodeCart(conv.activeCart.items) : '';

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: branchLoc.name },
          body: {
            text: [
              `✅ Active branch set to *${branchLoc.name}*`,
              `📍 ${branchLoc.address}, ${branchLoc.city} ${branchLoc.postcode}`,
              `📞 ${branchLoc.phone}`,
              ``,
              `🕐 Open daily: 10:00 AM – 02:00 AM midnight`,
              ``,
              conv.activeCart?.items?.length
                ? `🛒 You have ${conv.activeCart.items.length} item(s) in your basket. Ready to checkout?`
                : `Tap *Browse Menu* to explore dishes freshly cooked to order! 👇`,
            ].join('\n'),
          },
          action: {
            buttons: conv.activeCart?.items?.length
              ? [
                  { type: 'reply', reply: { id: `tov_col_${carriedCartStr}`, title: '🏪 Collection' } },
                  { type: 'reply', reply: { id: `tov_del_${carriedCartStr}`, title: '🛵 Delivery' } },
                  { type: 'reply', reply: { id: `tov_more_${carriedCartStr}`, title: '➕ Add More' } },
                ]
              : [
                  { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
                  { type: 'reply', reply: { id: 'tov_choose_branch', title: '🔄 Switch Branch' } },
                ],
          },
        },
      });
      return;
    }

    // ── Category Button (e.g. from curated dish alternative) ─────
    if (buttonId.startsWith('cat_')) {
      const [catId, carriedCart] = buttonId.split('~');
      const rows = buildItemListRows(catId, carriedCart, activeBranch);
      if (rows.length > 0) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'list',
            header: { type: 'text', text: getSectionTitle(catId, activeBranch) },
            body: { text: `Here are our ${getSectionTitle(catId, activeBranch)} options. Tap to add:` },
            footer: { text: `Taste of Village ${loc.city}` },
            action: {
              button: 'Select Dish',
              sections: [{ title: getSectionTitle(catId, activeBranch), rows }],
            },
          },
        });
        return;
      }
    }

    // ── Direct Add Dish (e.g. from recommendation) ──────────────
    if (buttonId.startsWith('tov_add_')) {
      const items = decodeCart(buttonId.replace('tov_add_', ''));
      if (items.length) {
        const total = cartTotal(items);
        await updateConversation(from, {
          activeCart: { items, basePence: total, branchId: activeBranch, updatedAt: new Date().toISOString() },
          state: 'idle',
        });
        await sendWhatsAppMessage(phoneId, from, {
          type: 'interactive',
          interactive: {
            type: 'button',
            header: { type: 'text', text: 'Dish Added' },
            body: {
              text: [
                `🛒 *Your Basket:*`,
                cartSummaryText(items),
                `*Total: ${formatPrice(total / 100)}*`,
                '',
                'Ready to checkout?',
              ].join('\n'),
            },
            action: {
              buttons: [
                { type: 'reply', reply: { id: `tov_col_${encodeCart(items)}`, title: '🏪 Collection' } },
                { type: 'reply', reply: { id: `tov_del_${encodeCart(items)}`, title: '🛵 Delivery' } },
                { type: 'reply', reply: { id: `tov_more_${encodeCart(items)}`, title: '➕ Add More' } },
              ],
            },
          },
        });
        return;
      }
    }

    // ── Checkout → ask Collection/Delivery ───────────────────────
    if (buttonId.startsWith('tov_checkout')) {
      let items: CartItem[] = [];
      if (buttonId.startsWith('tov_checkout_')) {
        items = decodeCart(buttonId.replace('tov_checkout_', ''));
      }
      if (!items.length) {
        items = conv.activeCart?.items || [];
      }
      if (!items.length) {
        await sendWhatsAppMessage(phoneId, from, {
          type: 'text',
          text: { body: '🛒 Your basket is empty! Type *Menu* to browse our dishes.' },
        });
        return;
      }

      const total = cartTotal(items);
      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'Select Fulfillment' },
          body: {
            text: [
              `🛒 *Your Order:*`,
              cartSummaryText(items),
              `*Total: ${formatPrice(total / 100)}*`,
              '',
              'How would you like to receive your food?',
            ].join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_col_${encodeCart(items)}`, title: '🏪 Collection' } },
              { type: 'reply', reply: { id: `tov_del_${encodeCart(items)}`, title: '🛵 Delivery' } },
            ],
          },
        },
      });
      return;
    }

    // ── Add More → category list (preserving existing encoded cart) ─
    if (buttonId.startsWith('tov_more_') || buttonId === 'tov_add_more' || buttonId === 'tov_menu') {
      let carriedCart = '';
      if (buttonId.startsWith('tov_more_')) {
        carriedCart = buttonId.replace('tov_more_', '');
      }
      await sendCategoryList(phoneId, from, carriedCart);
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

    // ── Collection → generate payment link (Stateless & Resilient) ──
    if (buttonId.startsWith('tov_col_') || buttonId === 'tov_collection') {
      let items: CartItem[] = [];
      if (buttonId.startsWith('tov_col_')) {
        items = decodeCart(buttonId.replace('tov_col_', ''));
      }
      if (!items.length) {
        items = conv.activeCart?.items || [];
      }
      const branchKey = getEffectiveBranch(conv);
      const branchLoc = LOCATIONS[branchKey];

      if (!items.length) {
        // Resilient Fallback: Generate QuickPay link so customer is NEVER blocked!
        const fallbackPence = conv.activeCart?.basePence || 99;
        const quickPay = await createQuickPayFallbackLink({
          branchId: branchKey,
          totalPence: fallbackPence,
          memo: `Taste of Village ${branchLoc.city} Collection Order`,
          isDelivery: false,
        });

        if (quickPay.url) {
          await sendWhatsAppMessage(phoneId, from, {
            type: 'text',
            text: {
              preview_url: false,
              body: [
                `🏪 *${branchLoc.name} Collection Order*`,
                '',
                `📍 Pickup at: *${branchLoc.name}*`,
                `_${branchLoc.address}, ${branchLoc.city} ${branchLoc.postcode}_`,
                '',
                `💳 Complete your secure payment here (Apple Pay / GPay / Card):`,
                quickPay.url,
              ].join('\n'),
            },
          });
          return;
        }

        await sendCategoryList(phoneId, from);
        return;
      }
      const total = cartTotal(items);
      await generateCheckoutLink(phoneId, from, name, { items, basePence: total, branchId: branchKey }, false, 0, undefined, undefined, branchKey);
      return;
    }

    // ── Delivery → prompt for postcode or use pending delivery ──
    if (buttonId.startsWith('tov_del_') || buttonId === 'tov_delivery') {
      let items: CartItem[] = [];
      if (buttonId.startsWith('tov_del_')) {
        items = decodeCart(buttonId.replace('tov_del_', ''));
      }
      if (!items.length) {
        items = conv.activeCart?.items || [];
      }
      if (!items.length) {
        await sendCategoryList(phoneId, from);
        return;
      }

      const branchKey = getEffectiveBranch(conv);
      const branchLoc = LOCATIONS[branchKey];
      const total = cartTotal(items);

      await updateConversation(from, {
        state: 'awaiting_postcode',
        activeCart: { items, basePence: total, branchId: branchKey, updatedAt: new Date().toISOString() },
      });

      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: {
          body: [
            `🛵 *${branchLoc.name} Delivery Order*`,
            `Please reply with your delivery postcode or full address:`,
            `_(e.g., 14 High Street, UB4 0RU or SL1 4NL)_`,
            ``,
            `We will verify delivery distance and calculate your delivery fee!`,
          ].join('\n'),
        },
      });
      return;
    }
  }
}

async function handleOrderMessage(phoneId: string, from: string, name: string, message: any) {
  const orderItems: any[] = message.order?.product_items || [];
  if (!orderItems.length) return;

  const conv = await getConversation(from);
  const branchId = getEffectiveBranch(conv);

  const cartItems: CartItem[] = [];
  let totalPence = 0;

  for (const item of orderItems) {
    const menuItem = getMenuItemById(item.product_retailer_id, branchId);
    const pricePence = menuItem
      ? Math.round(menuItem.price * 100)
      : Math.round(parseFloat(item.item_price || '0') * 100);
    const qty = Number(item.quantity) || 1;
    const itemName = menuItem?.name || item.product_retailer_id;

    cartItems.push({ id: item.product_retailer_id, name: itemName, quantity: qty, pricePence });
    totalPence += pricePence * qty;

    // Cache catalog items so decodeCart can recover name/price for non-menu IDs
    if (!menuItem) {
      CATALOG_ITEM_CACHE.set(item.product_retailer_id, { name: itemName, pricePence });
    }
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
          { type: 'reply', reply: { id: `tov_col_${encodeCart(cartItems)}`, title: '🏪 Collection' } },
          { type: 'reply', reply: { id: `tov_del_${encodeCart(cartItems)}`, title: '🛵 Delivery' } },
          { type: 'reply', reply: { id: `tov_more_${encodeCart(cartItems)}`, title: '➕ Add More' } },
        ],
      },
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
// Sub-Handlers
// ══════════════════════════════════════════════════════════════════════

const UK_POSTCODE_REGEX = /\b([A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2})\b/i;

async function handleAddressInput(
  phoneId: string,
  from: string,
  name: string,
  rawText: string,
  conv: ConversationState
) {
  const cart = conv.activeCart;
  if (!cart?.items?.length) {
    await updateConversation(from, { state: 'idle', pendingDelivery: null });
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: { body: '🛒 Your basket is empty! Type *Menu* to browse dishes.' },
    });
    return;
  }

  const trimmed = rawText.trim();
  const postcodeMatch = trimmed.match(UK_POSTCODE_REGEX);

  // ── Scenario A: Customer provided a UK postcode (either alone or with full street address) ──
  if (postcodeMatch) {
    const rawPostcode = postcodeMatch[1].toUpperCase().trim();
    const streetPart = trimmed
      .replace(postcodeMatch[0], '')
      .replace(/^[,\s-]+|[,\s-]+$/g, '')
      .trim();

    const geo = await geocodePostcode(rawPostcode);
    if (!geo.valid || !geo.lat || !geo.lng) {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: {
          body: `❌ We couldn't verify postcode *${rawPostcode}*. Please check and reply with your address (e.g. *14 High Street, UB4 0RU*), or type *Collection* to collect.`,
        },
      });
      return;
    }

    const milesHayes = haversineDistanceMiles(LOCATIONS.hayes.coords.lat, LOCATIONS.hayes.coords.lng, geo.lat, geo.lng);
    const milesSlough = haversineDistanceMiles(LOCATIONS.slough.coords.lat, LOCATIONS.slough.coords.lng, geo.lat, geo.lng);

    const tierHayes = getDeliveryFeeByDistance(milesHayes, 'hayes');
    const tierSlough = getDeliveryFeeByDistance(milesSlough, 'slough');

    // ── Dynamic Dual-Branch Delivery Arbitration ──
    let effectiveBranch: LocationId;
    let effectiveMiles: number;
    let effectiveTier: typeof tierHayes;
    let branchNotice = '';

    if (tierHayes.eligible && !tierSlough.eligible) {
      effectiveBranch = 'hayes';
      effectiveMiles = milesHayes;
      effectiveTier = tierHayes;
      if (conv.branchId === 'slough') {
        branchNotice = `📍 *${geo.formatted}* is within our Hayes delivery area (${milesHayes.toFixed(1)} mi). We've routed your delivery to *Taste of Village Hayes*!\n\n`;
      }
    } else if (tierSlough.eligible && !tierHayes.eligible) {
      effectiveBranch = 'slough';
      effectiveMiles = milesSlough;
      effectiveTier = tierSlough;
      if (conv.branchId === 'hayes') {
        branchNotice = `📍 *${geo.formatted}* is within our Slough delivery area (${milesSlough.toFixed(1)} mi). We've routed your delivery to *Taste of Village Slough*!\n\n`;
      }
    } else if (tierHayes.eligible && tierSlough.eligible) {
      // Both branches can deliver — choose user preference or closer branch
      if (conv.branchId === 'slough' || conv.branchId === 'hayes') {
        effectiveBranch = conv.branchId;
      } else {
        effectiveBranch = milesSlough < milesHayes ? 'slough' : 'hayes';
      }
      effectiveMiles = effectiveBranch === 'slough' ? milesSlough : milesHayes;
      effectiveTier = effectiveBranch === 'slough' ? tierSlough : tierHayes;
    } else {
      // Neither branch is eligible (> 5 miles from both)
      const closestBranch: LocationId = milesSlough < milesHayes ? 'slough' : 'hayes';
      const closestLoc = LOCATIONS[closestBranch];
      const otherBranch: LocationId = closestBranch === 'slough' ? 'hayes' : 'slough';
      const otherLoc = LOCATIONS[otherBranch];
      const closestMiles = Math.min(milesSlough, milesHayes);
      const otherMiles = Math.max(milesSlough, milesHayes);

      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'Out of Delivery Range' },
          body: {
            text: [
              `📍 *${geo.formatted}* is outside our 5-mile delivery radius:`,
              `• ${closestLoc.city}: ${closestMiles.toFixed(1)} miles away`,
              `• ${otherLoc.city}: ${otherMiles.toFixed(1)} miles away`,
              ``,
              `To ensure our authentic Desi dishes arrive sizzling hot, we deliver within 5.0 miles only.`,
              ``,
              `Would you like to collect your order from our ${closestLoc.city} restaurant instead?`,
            ].join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_col_${encodeCart(cart.items)}`, title: `🏪 Collect (${closestLoc.city})` } },
              { type: 'reply', reply: { id: 'tov_choose_branch', title: '🔄 Change Branch' } },
            ],
          },
        },
      });
      return;
    }

    const loc = LOCATIONS[effectiveBranch];
    const subtotalPounds = cart.basePence / 100;
    const minOrder = loc.delivery.minOrder;

    if (subtotalPounds < minOrder) {
      const diff = minOrder - subtotalPounds;
      await sendWhatsAppMessage(phoneId, from, {
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: 'Minimum Order' },
          body: {
            text: [
              branchNotice.trim(),
              `🛵 *${loc.name} Delivery*`,
              `Our minimum order for delivery is *£${minOrder.toFixed(2)}*.`,
              `Your basket total is *${formatPrice(subtotalPounds)}*.`,
              ``,
              `Please add *${formatPrice(diff)}* more to qualify for delivery, or choose Store Collection!`,
            ].filter(Boolean).join('\n'),
          },
          action: {
            buttons: [
              { type: 'reply', reply: { id: `tov_more_${encodeCart(cart.items)}`, title: '➕ Add Dishes' } },
              { type: 'reply', reply: { id: `tov_col_${encodeCart(cart.items)}`, title: '🏪 Collection Instead' } },
            ],
          },
        },
      });
      return;
    }

    const isFree = subtotalPounds >= effectiveTier.freeThreshold;
    const deliveryFeePence = isFree ? 0 : Math.round(effectiveTier.fee * 100);

    // Save updated branch and pending delivery
    await updateConversation(from, {
      branchId: effectiveBranch,
      pendingDelivery: {
        branchId: effectiveBranch,
        postcode: geo.formatted || rawPostcode,
        miles: effectiveMiles,
        deliveryFeePence,
      },
    });

    // If street address was included in the same message (e.g. "14 High Street, UB4 0RU")
    if (streetPart.length >= 2) {
      await generateCheckoutLink(
        phoneId,
        from,
        name,
        cart,
        true,
        deliveryFeePence,
        geo.formatted || rawPostcode,
        streetPart,
        effectiveBranch
      );
      return;
    }

    // Otherwise they only gave the postcode: save quote & ask for house/street number
    await updateConversation(from, {
      state: 'awaiting_address',
      branchId: effectiveBranch,
      pendingDelivery: {
        branchId: effectiveBranch,
        postcode: geo.formatted || rawPostcode,
        miles: effectiveMiles,
        deliveryFeePence,
      },
    });

    const feeDesc = deliveryFeePence === 0 ? '*FREE* 🎉' : formatPrice(deliveryFeePence / 100);
    const est = loc.delivery.estimatedMinutes.delivery;
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        body: [
          branchNotice ? branchNotice.trim() : null,
          `✅ *Postcode confirmed:* ${geo.formatted} (${effectiveMiles.toFixed(1)} miles from ${loc.city})`,
          `🛵 Delivery: ${feeDesc} • Est. ${est.min}–${est.max} mins`,
          ``,
          `🏠 *What is your street address?*`,
          `Please reply with your house/flat number and street name:`,
          `_(e.g., 14 High Street, Flat 2B)_`,
        ].filter(Boolean).join('\n'),
      },
    });
    return;
  }

  // ── Scenario B: Customer replied with street address following a previously confirmed postcode ──
  if (conv.pendingDelivery?.postcode) {
    if (trimmed.length < 2) {
      await sendWhatsAppMessage(phoneId, from, {
        type: 'text',
        text: { body: 'Please reply with your building/flat number and street name (e.g., *14 High Street*):' },
      });
      return;
    }

    const effectiveBranch = conv.pendingDelivery.branchId || getEffectiveBranch(conv);
    await generateCheckoutLink(
      phoneId,
      from,
      name,
      cart,
      true,
      conv.pendingDelivery.deliveryFeePence || 0,
      conv.pendingDelivery.postcode,
      trimmed,
      effectiveBranch
    );
    return;
  }

  // ── Scenario C: No postcode detected and no quote yet ──
  await sendWhatsAppMessage(phoneId, from, {
    type: 'text',
    text: {
      body: `🛵 Please include your UK postcode with your delivery address:\n_(e.g., 14 High Street, UB4 0RU or SL1 4NL)_`,
    },
  });
}

async function generateCheckoutLink(
  phoneId: string,
  from: string,
  name: string,
  cart: { items: CartItem[]; basePence: number; branchId?: LocationId },
  isDelivery: boolean,
  deliveryFeePence: number,
  postcode?: string,
  streetAddress?: string,
  branchId?: LocationId
) {
  const effectiveBranch: LocationId = branchId || cart.branchId || DEFAULT_BRANCH_ID;
  const loc = LOCATIONS[effectiveBranch];

  const items: CheckoutLineItem[] = cart.items.map(i => ({
    name: i.name,
    quantity: i.quantity,
    pricePence: i.pricePence,
  }));

  const { url: squareLink, orderId, referenceId } = await createItemisedCheckoutLink({
    branchId: effectiveBranch,
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
    branchId: effectiveBranch,
    branchName: loc.name,
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

  // Store order in background (never blocks payment link delivery)
  if (referenceId) {
    adminDb.collection('whatsapp_orders').doc(referenceId).set(orderRecord).catch(() => {});
  }
  if (orderId && orderId !== referenceId) {
    adminDb.collection('whatsapp_orders').doc(orderId).set(orderRecord).catch(() => {});
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
    branchId: effectiveBranch,
    pendingDelivery: null,
    activeCart: {
      ...cart,
      branchId: effectiveBranch,
      checkoutLink: squareLink,
      checkoutOrderId: orderId || referenceId,
      checkoutReferenceId: referenceId,
      checkoutAt: new Date().toISOString(),
    },
  });

  if (isDelivery) {
    const feeText = deliveryFeePence === 0 ? '*FREE* 🎉' : formatPrice(deliveryFeePence / 100);
    const est = loc.delivery.estimatedMinutes.delivery;
    await sendWhatsAppMessage(phoneId, from, {
      type: 'text',
      text: {
        preview_url: false,
        body: [
          `🛵 *${loc.name} Delivery Order*`,
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
          `🏪 *${loc.name} Collection Order*`,
          '',
          `📋 *Items:*`,
          cartSummaryText(cart.items),
          '',
          `*Total: ${formatPrice(totalPence / 100)}*`,
          '',
          `📍 Pickup at: *${loc.name}*`,
          `_${loc.address}, ${loc.city} ${loc.postcode}_`,
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
          { type: 'reply', reply: { id: `tov_col_${encodeCart(cart.items)}`, title: '🏪 Collection' } },
          { type: 'reply', reply: { id: `tov_del_${encodeCart(cart.items)}`, title: '🛵 Delivery' } },
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

  const branchId = getEffectiveBranch(conv);
  const loc = LOCATIONS[branchId];
  const hasExplicitBranch = !!conv?.branchId;

  let cartSection = '';
  if (hasCart) {
    cartSection = `\n\n🛒 *Your Basket:* ${conv!.activeCart!.items.length} item(s) (${formatPrice(conv!.activeCart!.basePence / 100)})`;
    if (checkoutLink) {
      cartSection += `\n💳 *Payment Link Ready:* ${checkoutLink}`;
    }
  }

  const fastMenuUrl = `https://tasteofvillagerestaurants.co.uk/${branchId}/order?phone=${from}`;

  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: loc.name },
      body: {
        text: [
          `👋 *${timeGreeting}${cleanName}!* Welcome to Taste of Village.`,
          `📍 Active Branch: *${loc.name}* (${loc.city})`,
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
              { type: 'reply', reply: { id: `tov_col_${encodeCart(conv!.activeCart!.items)}`, title: '🏪 Collection' } },
              { type: 'reply', reply: { id: `tov_del_${encodeCart(conv!.activeCart!.items)}`, title: '🛵 Delivery' } },
              { type: 'reply', reply: { id: `tov_more_${encodeCart(conv!.activeCart!.items)}`, title: '📋 Browse Menu' } },
            ]
          : hasExplicitBranch
          ? [
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
              { type: 'reply', reply: { id: 'tov_choose_branch', title: '🔄 Switch Branch' } },
            ]
          : [
              { type: 'reply', reply: { id: 'tov_branch_hayes', title: '📍 Hayes (UB4)' } },
              { type: 'reply', reply: { id: 'tov_branch_slough', title: '📍 Slough (SL1)' } },
              { type: 'reply', reply: { id: 'tov_menu', title: '📋 Browse Menu' } },
            ],
      },
    },
  });
}

async function sendCategoryList(phoneId: string, from: string, carriedCart?: string) {
  const conv = await getConversation(from);
  const branchId = getEffectiveBranch(conv);
  const loc = LOCATIONS[branchId];
  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: `${loc.name} Menu` },
      body: { text: carriedCart ? 'Pick a category to add more dishes:' : 'Pick a category to browse dishes:' },
      footer: { text: `Taste of Village ${loc.city} • Open 10AM–2AM` },
      action: {
        button: '📋 Browse Menu',
        sections: buildMenuCategorySections(carriedCart, branchId),
      },
    },
  });
}

async function sendBranchSelector(phoneId: string, from: string, conv?: ConversationState) {
  const currentBranch = getEffectiveBranch(conv);
  await sendWhatsAppMessage(phoneId, from, {
    type: 'interactive',
    interactive: {
      type: 'button',
      header: { type: 'text', text: 'Select Your Branch' },
      body: {
        text: [
          `Welcome to *Taste of Village*!`,
          `We have two branch locations serving authentic Lahore & Gujranwala food (10:00 AM – 02:00 AM daily):`,
          ``,
          `📍 *Hayes:* 766B Uxbridge Rd, UB4 0RU`,
          `📍 *Slough:* 260 Farnham Road, SL1 4XL`,
          ``,
          `Active branch: *${LOCATIONS[currentBranch].name}*`,
          `Tap below to select or switch your branch:`,
        ].join('\n'),
      },
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'tov_branch_hayes', title: '📍 Hayes (UB4)' } },
          { type: 'reply', reply: { id: 'tov_branch_slough', title: '📍 Slough (SL1)' } },
        ],
      },
    },
  });
}
