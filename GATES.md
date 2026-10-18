# GATES.md — Taste of Village Fixes & Verification

## Acceptance Gates

- [x] Gate 1: WABA Bot & Gemini Smart Reply
  - Fixed `geminiAssistant.ts`: Updated default model from broken `gemini-2.5-flash` to active `gemini-2.0-flash`, increased safety timeout from 2500ms to 6000ms, made assistant dynamically branch-aware for Hayes & Slough, and added deterministic chef sensory fallback.
  - Fixed `sendFullCatalogMenu`: Tiered fail-safe ladder implemented. If Meta rejects `product_list`, automatically falls back to `sendCategoryList`, which in turn falls back to a clean plain-text menu.
  - Fixed `waba.ts`: Dynamic token resolution per phone/branch (`META_SLOUGH_ACCESS_TOKEN`, `META_HAYES_ACCESS_TOKEN`, `META_CATALOG_ACCESS_TOKEN`) and non-blocking persistent logging to Firestore collection `waba_logs`.
  - CHECK: Automated verification via `scratch/verify_gates.js` (Tests 1-3).
  - RESULT: PASS (All checks verified).

- [x] Gate 2: Website WhatsApp Links
  - Updated `shopConfig.ts` `whatsappNumber` getter to return active branch mobile WABA number (`447424216045` / `447337389133`).
  - Updated all hardcoded landline WhatsApp links across `Footer.tsx`, `links/page.tsx`, `offers/page.tsx`, `slough-sunday-roast/page.tsx`, `check-in/CheckInClient.tsx`, and `print-qr/page.tsx`.
  - CHECK: Grep across `src/` for `wa.me/441753` and `wa.me/44203`.
  - RESULT: PASS (0 landline WhatsApp links remain across entire codebase).

- [x] Gate 3: Discount & Voucher System Fixes
  - Updated `square/route.ts` prefix filter to include `HALF-`, `SAVE-`, and `STUDENT50`.
  - Created `/api/leads/check-in` and updated `CampaignService.ts` to provision active voucher records in Firestore `vouchers` collection upon `/check-in` submission, resolving the "Voucher code not found" redemption error.
  - Updated `VoucherService.ts` `issueFirstTimeBuyerPack` to issue 50% vouchers with `branch: 'all'`, fixing the Slough customer exclusion bug.
  - Updated `weather-promo` route fixing casing bug (`discountType: 'PERCENTAGE'`).
  - Added native support for `STUDENT50` promo code resolution in `promos/validate` and `checkout/square`.
  - CHECK: Automated verification via `scratch/verify_gates.js` (Tests 16-21).
  - RESULT: PASS (All voucher types resolved with correct percentage and branch eligibility).

- [x] Gate 4: Outbound Friday Broadcast Compliance
  - Updated `friday-broadcast` to support pre-approved Meta message templates (`META_FRIDAY_TEMPLATE_NAME`) for out-of-session broadcast, and gracefully handle Meta error 131047 (outside 24h service window) without crashing or failing the cron.
  - CHECK: Automated verification via `scratch/verify_gates.js` (Tests 22-23).
  - RESULT: PASS (Payload structure and error suppression verified).

- [x] Gate 5: Analytics Cleanup
  - Removed duplicate Microsoft Clarity tag (`ydv01vt483`) in `layout.tsx`, leaving single canonical project `ymj4wrzgfx`.
  - CHECK: Grep in `layout.tsx` for `clarity.ms/tag`.
  - RESULT: PASS (Exactly 1 Clarity tag present).

- [x] Gate 6: 4-Hour Health Monitoring Automation
  - Created `/home/kali/.gemini/config/sidecars/tov-4h-health-audit/sidecar.json` scheduled every 4 hours (`CRON_TZ=Europe/London 0 */4 * * *`).
  - Probes live website health, kitchen statuses for Hayes & Slough, promo code validation pipeline (`STUDENT50`), and delivery quote calculation.
  - CHECK: Automated verification via `scratch/verify_gates.js` (Tests 25-27).
  - RESULT: PASS (Valid schema, cron, and display name verified).
