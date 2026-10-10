# WABA Bot — Architectural Decisions & Learnings

> This file is maintained by agents. It records hard-won lessons from production debugging.

## 1. Branch State Must Travel in Message IDs

**Decision:** Encode `branchId` in WhatsApp list/button row IDs (format: `cat_xxx~cart~branch`).

**Why:** Vercel serverless containers don't share memory. In-memory cache is empty on cold starts. Firestore async writes race against the next request's read. The only reliable state carrier across requests is the WhatsApp message ID itself.

**Layers (priority order):**
1. Row ID encoding (`cat_xxx~cart~slough`)
2. Item ID prefix (`tov_slough_*` → branch is slough)
3. In-memory cache (volatile, same-container only)
4. Firestore read (async, 250ms timeout)
5. Default: `hayes`

## 2. Local Pattern Matching Before Gemini AI

**Decision:** Curated dish → category match → keyword search → Gemini (last resort).

**Why:** Gemini takes 2-10 seconds. Local matching takes 0ms. "karahi", "biryani", "naan" etc. get instant responses.

## 3. Button Taps Can Arrive as Plain Text

**Decision:** Text handler must match button title patterns like "Slough (SL1)" and "Hayes (UB4)".

**Why:** Some WhatsApp clients send button taps as `message.type === 'text'` instead of `message.type === 'interactive'`.

## 4. Cross-Branch Category Fallback

**Decision:** If `buildItemListRows(catId, cart, branch)` returns 0 items, try the other branch.

**Why:** Category IDs like `cat_platters` exist in Slough but not Hayes. If the branch resolves wrong, the fallback finds the items in the correct branch and silently corrects the stored branch.

## 5. Anti-Slop: No Decorative Emojis

**Decision:** Zero decorative emojis in message body text. Only functional emojis on buttons (🏪 🛵 ➕) and category titles (🔥 🍛 🍚 etc.).

**Why:** User explicitly demanded it. Category title emojis are functional (24-char title limit, visual scanning).

## 6. searchMenuDishes Stopwords

**Decision:** Stopwords include branch names (`slough`, `hayes`), action words (`menu`, `order`, `buy`, `eat`), and location words (`farnham`, `uxbridge`, `delivery`, `collection`).

**Why:** Without these, "slough menu for karahi" matches every item with "menu" in its description.

## 7. Meta Catalog Product List vs Text List (Oct 2026)

**Decision:** Use `product_list` interactive messages (rich product cards with images, prices, add-to-cart) when the customer has no active cart. Fall back to text `list` messages when the cart contains items.

**Why:** Product list messages show catalog items with images and prices, with native add-to-cart — far better UX than text-only lists. However, `product_list` messages don't support carrying cart state in row IDs. The existing text list system encodes cart state as `cat_xxx~cartdata~branch` in row IDs. So:
- **Empty cart** → `sendFullCatalogMenu()` or `sendCatalogProductList()` → rich experience
- **Has cart items** → `sendCategoryList()` / `buildItemListRows()` → preserves cart

**Catalog IDs:** Hayes `987964757674623`, Slough `1657059252594459`.
**Limits:** Max 30 products across up to 10 sections per product_list message.
**retailer_id mapping:** Catalog `retailer_id` values match `item.id` from `tov-menu.json` / `tov-menu-slough.json`.

## 8. Meta App Review — Webhook Delivery Requires All Test Calls (Oct 2026)

**Decision:** Do NOT rely on system user token API calls to satisfy the Testing page requirements. Use Graph API Explorer with a User Token to make explicit test calls.

**Why:** We spent 14+ hours debugging webhook non-delivery. Everything was configured correctly (subscriptions, callback URL, verify token). The root cause: Meta's App Review Testing page requires specific API test calls per permission before enabling real webhook delivery. System user API calls do NOT count — only Graph API Explorer calls with the app's own User Token are registered. The specific requirements:
- `whatsapp_business_messaging` — send a test message
- `whatsapp_business_management` — any WABA query
- `business_management` — `GET /me/businesses` (1 call)
- `public_profile` — `GET /me` (3 calls)
