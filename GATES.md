# GATES.md — Taste of Village Fixes & Verification

## Acceptance Gates

- [ ] Gate 1: WABA Bot & Gemini Smart Reply
  - Fix `geminiAssistant.ts` valid model name (`gemini-2.0-flash` / `gemini-1.5-flash`) and dynamic branch awareness.
  - Fix `sendFullCatalogMenu` with automatic fallback to `sendCategoryList` if Meta rejects `product_list`.
  - Fix `waba.ts` token resolution per branch and add persistent `waba_logs` logging in Firestore.
  - CHECK: Node simulation verifying `sendFullCatalogMenu` fallback and Gemini Assistant prompt resolution.
  - EXPECT: PASS

- [ ] Gate 2: Website WhatsApp Links
  - Update `shopConfig.ts` `whatsappNumber` to return active branch mobile WABA number (`447424216045` / `447337389133`).
  - Update all hardcoded landline WhatsApp links in `Footer.tsx`, `links/page.tsx`, `offers/page.tsx`, `slough-sunday-roast/page.tsx`, `check-in/CheckInClient.tsx`, `print-qr/page.tsx`.
  - CHECK: Grep across `src/` for `wa.me/441753` and `wa.me/44203`.
  - EXPECT: Zero landline WhatsApp links remaining.

- [ ] Gate 3: Discount & Voucher System Fixes
  - Update `square/route.ts` prefix filter to include `HALF-`, `SAVE-`, and `STUDENT`.
  - Update `CampaignService.ts` to insert into `vouchers` on `/check-in` submission.
  - Update `VoucherService.ts` first-time pack to allow 50% vouchers for `branch: 'all'`.
  - Update `weather-promo` `discountType: 'PERCENTAGE'` casing bug.
  - Support `STUDENT50` promo code resolution.
  - CHECK: Test voucher validation logic for `HALF-`, `SAVE-`, `TOV50-`, and `STUDENT50`.
  - EXPECT: Valid voucher resolution with non-zero discounts.

- [ ] Gate 4: Outbound Friday Broadcast Compliance
  - Update `friday-broadcast` to handle 24h window or use template payload safely without crashing or throwing 131047 unhandled errors.
  - CHECK: Verify payload structure.
  - EXPECT: PASS

- [ ] Gate 5: Analytics Cleanup
  - Remove duplicate Microsoft Clarity tag in `layout.tsx`.
  - CHECK: Verify single Clarity tag in `layout.tsx`.
  - EXPECT: PASS

- [ ] Gate 6: 4-Hour Health Monitoring Automation
  - Create `<configDir>/sidecars/tov-4h-health-audit/sidecar.json` scheduled every 4 hours (`CRON_TZ=Europe/London 0 */4 * * *`).
  - CHECK: Verify JSON schema and cron expression.
  - EXPECT: PASS
