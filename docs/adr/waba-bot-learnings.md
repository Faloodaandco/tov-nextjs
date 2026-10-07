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
