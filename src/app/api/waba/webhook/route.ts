import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { sendWhatsAppMessage } from "@/lib/waba";
import { createQuickPayFallback } from "@/lib/square";

// ── TOV Hayes Menu Definitions ──
const TOV_TOP_DISHES: Record<string, { title: string; pricePence: number; price: string; image: string; caption: string }> = {
  tov_chicken_karahi: {
    title: 'Chicken Karahi', pricePence: 1299, price: '£12.99',
    image: 'https://tasteofvillagerestaurants.co.uk/images/chicken_karahi.jpg',
    caption: '🥘 *Authentic Chicken Karahi* (£12.99)\n\nCooked fresh in a traditional wok with tomatoes, ginger, green chilies, and our secret blend of village spices.'
  },
  tov_lamb_biryani: {
    title: 'Lamb Biryani', pricePence: 1450, price: '£14.50',
    image: 'https://tasteofvillagerestaurants.co.uk/images/lamb_biryani.jpg',
    caption: '🍚 *Dum Pukht Lamb Biryani* (£14.50)\n\nTender lamb marinated overnight, layered with fragrant basmati rice and slow-cooked to perfection.'
  },
  tov_mixed_grill: {
    title: 'Mixed Grill Platter', pricePence: 2200, price: '£22.00',
    image: 'https://tasteofvillagerestaurants.co.uk/images/mixed_grill.jpg',
    caption: '🔥 *Village Mixed Grill* (£22.00)\n\nSizzling seekh kebabs, chicken tikka, lamb chops, and malai boti fresh from the tandoor.'
  }
};

// ── Delivery Rules ──
const MINIMUM_DELIVERY_PENCE = 2000; // £20.00
const STANDARD_DELIVERY_FEE_PENCE = 399; // £3.99
const FREE_DELIVERY_THRESHOLD_PENCE = 5000; // £50.00

// ── Helpers ──
async function getActiveCart(phone: string): Promise<{ items: any[]; basePence: number } | null> {
  try {
    const docSnap = await adminDb.collection('whatsapp_conversations').doc(phone).get();
    return docSnap.data()?.activeCart || null;
  } catch (e) {
    console.error('[TOV WABA] Error fetching cart:', e);
    return null;
  }
}

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

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    // 1. Strict Signature Verification 
    const signature = request.headers.get('x-hub-signature-256');
    const isProxy = request.headers.get('x-tenant-proxy') === 'falooda-master';
    const secret = process.env.WABA_APP_SECRET || process.env.META_APP_SECRET;

    if (secret && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
      const sigBuffer = Buffer.from(signature);
      const digestBuffer = Buffer.from(digest);
      if (sigBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(sigBuffer, digestBuffer)) {
        return new NextResponse('Invalid signature', { status: 403 });
      }
    } else if (!isProxy) {
       return new NextResponse('Missing signature', { status: 403 });
    }

    const body = JSON.parse(rawBody);

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        for (const message of change.value?.messages || []) {
          
          // ── Idempotency / Deduplication ──
          try {
            const dedupRef = adminDb.collection('webhook_dedup').doc(`tov_${message.id}`);
            const dedupSnap = await dedupRef.get();
            if (dedupSnap.exists) continue; // Skip duplicates silently
            
            await dedupRef.set({
              messageId: message.id,
              processedAt: new Date().toISOString(),
              expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), 
            });
          } catch (err) {
            console.warn('[TOV WABA] Dedup check failed, processing anyway', err);
          }

          const phoneId = change.value?.metadata?.phone_number_id;
          const from = message.from;
          const profileName = change.value?.contacts?.[0]?.profile?.name || from;

          
          

          // ── 1. Text Message (Intent parsing & Welcome) ──
          if (message.type === 'text') {
            const rawText = message.text?.body || '';
            const now = new Date().toISOString();
            
            try { await adminDb.collection('whatsapp_conversations').doc(from).set({
              phone: from, name: profileName, lastMessage: rawText, timestamp: now, unreadCount: 1,
            }, { merge: true }); } catch (e) { console.error("Firestore Error:", e); }

            const lowerText = rawText.toLowerCase();

            // Check if user is asking for menu
            if (lowerText.includes('menu') || lowerText.includes('order') || lowerText.includes('food')) {
              await sendWhatsAppMessage(phoneId, from, {
                type: 'interactive',
                interactive: {
                  type: 'list',
                  header: { type: 'text', text: 'Taste of Village Menu' },
                  body: { text: 'Select a signature dish to view details or add to your order:' },
                  footer: { text: 'Authentic Pakistani & Indian Cuisine' },
                  action: {
                    button: 'View Menu',
                    sections: [
                      {
                        title: 'Signature Dishes',
                        rows: [
                          { id: 'tov_chicken_karahi', title: 'Chicken Karahi', description: '£12.99' },
                          { id: 'tov_lamb_biryani', title: 'Lamb Biryani', description: '£14.50' },
                          { id: 'tov_mixed_grill', title: 'Mixed Grill Platter', description: '£22.00' }
                        ]
                      }
                    ]
                  }
                }
              });
            } else {
              // Generic Welcome
              await sendWhatsAppMessage(phoneId, from, {
                type: 'interactive',
                interactive: {
                  type: 'button',
                  body: { text: `👋 Welcome to *Taste of Village Hayes*!\n\nTo begin ordering, tap a button below or simply type "Menu".` },
                  action: {
                    buttons: [
                      { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
                      { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } }
                    ]
                  }
                }
              });
            }
          }
          
          // ── 2. Interactive Button & List Replies ──
          else if (message.type === 'interactive') {
            const replyType = message.interactive.type;
            
            // List Reply -> Show Dish Details
            if (replyType === 'list_reply') {
              const listId = message.interactive.list_reply.id;
              const dish = TOV_TOP_DISHES[listId];
              
              if (dish) {
                // Save this item to a temporary session cart for demo purposes
                try { await adminDb.collection('whatsapp_conversations').doc(from).set({
                  activeCart: {
                    items: [{ name: dish.title, quantity: 1, base_price_money: { amount: dish.pricePence, currency: 'GBP' } }],
                    basePence: dish.pricePence,
                    updatedAt: new Date().toISOString()
                  }
                }, { merge: true }); } catch (e) { console.error("Firestore Error:", e); }

                await sendWhatsAppMessage(phoneId, from, {
                  type: 'interactive',
                  interactive: {
                    type: 'button',
                    header: { type: 'text', text: dish.title },
                    body: { text: `${dish.caption}\n\n*Added to your order.* Would you like this for Collection or Delivery?` },
                    action: {
                      buttons: [
                        { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
                        { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } }
                      ]
                    }
                  }
                });
              }
            }
            
            // Button Reply -> Handle Checkout Routing
            else if (replyType === 'button_reply') {
              const buttonId = message.interactive.button_reply.id;

              if (buttonId === 'tov_collection' || buttonId === 'tov_delivery') {
                const isDelivery = buttonId === 'tov_delivery';
                
                // Fetch the active cart (or fallback to a test order if none exists)
                const cart = await getActiveCart(from);
                const baseAmount = cart ? cart.basePence : 2500; // Fallback to £25 if empty
                let deliveryFee = 0;

                // ── Delivery Rules Enforcement ──
                if (isDelivery) {
                  if (baseAmount < MINIMUM_DELIVERY_PENCE) {
                    const shortBy = ((MINIMUM_DELIVERY_PENCE - baseAmount) / 100).toFixed(2);
                    await sendWhatsAppMessage(phoneId, from, {
                      type: 'text',
                      text: {
                        preview_url: false,
                        body: `⚠️ *Minimum Delivery Order:* £20.00\n\nYour basket total is *£${(baseAmount / 100).toFixed(2)}*. You need *£${shortBy}* more to qualify for local delivery.\n\nYou can switch to *Collection* below, or type "Menu" to add more items.`,
                      }
                    });
                    // Skip checkout generation
                    continue; 
                  }
                  
                  // Apply delivery fee unless threshold met
                  if (baseAmount < FREE_DELIVERY_THRESHOLD_PENCE) {
                    deliveryFee = STANDARD_DELIVERY_FEE_PENCE;
                  }
                }

                // ── Generate Square Payment Link ──
                const { url: squareLink, orderId } = await createQuickPayFallback(
                  isDelivery,
                  baseAmount,
                  cart ? `TOV Order: ${cart.items.length} items` : 'Taste of Village Order',
                  deliveryFee
                );

                if (!squareLink) {
                  await sendWhatsAppMessage(phoneId, from, {
                    type: 'text',
                    text: { body: `Oops, our checkout system is currently updating. Please try again in a few minutes.` }
                  });
                  continue;
                }

                // ── Respond with Link ──
                if (isDelivery) {
                  const feeText = deliveryFee === 0 ? '*FREE*' : `£${(deliveryFee / 100).toFixed(2)}`;
                  await sendWhatsAppMessage(phoneId, from, {
                    type: 'text',
                    text: {
                      preview_url: false,
                      body: `🛵 *Private Delivery Selected!*\n\nDelivery fee: ${feeText}.\n\n💳 Please tap here to securely enter your delivery address and pay via Apple Pay / Google Pay:\n${squareLink}`
                    }
                  });
                } else {
                  await sendWhatsAppMessage(phoneId, from, {
                    type: 'text',
                    text: {
                      preview_url: false,
                      body: `🏪 *Collection Selected!*\n\nYour food will be freshly prepared for pickup at:\n📍 *766B Uxbridge Rd, Hayes UB4 0RU*\n\n💳 Please complete your secure payment here:\n${squareLink}`
                    }
                  });
                }
              }
            }
          }
          
          // ── 3. Native Catalog Cart (Order Received) ──
          else if (message.type === 'order') {
            const orderItems = message.order?.product_items || [];
            let totalPence = 0;
            const itemsStr = orderItems.map((item: any) => {
              // Note: item.item_price is a string like "4.99", so we parse it
              const price = parseFloat(item.item_price || '0');
              totalPence += price * 100 * (item.quantity || 1);
              return `${item.quantity}x ${item.product_retailer_id}`;
            });

            // Save the cart to Firestore session
            try { await adminDb.collection('whatsapp_conversations').doc(from).set({
              activeCart: {
                items: orderItems,
                basePence: Math.round(totalPence),
                updatedAt: new Date().toISOString()
              }
            }, { merge: true }); } catch (e) { console.error("Firestore Error:", e); }

            await sendWhatsAppMessage(phoneId, from, {
              type: 'interactive',
              interactive: {
                type: 'button',
                header: { type: 'text', text: 'Order Received' },
                body: { text: `We received your shopping cart containing ${orderItems.length} items (Total: £${(totalPence / 100).toFixed(2)}).\n\nWould you like this for Collection or Delivery?` },
                action: {
                  buttons: [
                    { type: 'reply', reply: { id: 'tov_collection', title: '🏪 Collection' } },
                    { type: 'reply', reply: { id: 'tov_delivery', title: '🛵 Delivery' } }
                  ]
                }
              }
            });
          }
        }
      }
    }
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error('[TOV WABA] Webhook Fatal Error', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
