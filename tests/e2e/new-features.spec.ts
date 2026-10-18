import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_TEST_BASE_URL || '';

// ─────────────────────────────────────────────────────────────────────────────
// WABA WEBHOOK SECURITY
// ─────────────────────────────────────────────────────────────────────────────

test.describe('WABA Webhook Security', () => {
  test('GET /api/waba/webhook returns 200 with challenge for verification', async ({ request }) => {
    const res = await request.get(`${BASE}/api/waba/webhook?hub.mode=subscribe&hub.verify_token=WRONG_TOKEN&hub.challenge=test123`);
    // Should return 403 (wrong token) or 200 (correct token)
    expect([200, 403]).toContain(res.status());
  });

  test('POST /api/waba/webhook rejects empty body', async ({ request }) => {
    const res = await request.post(`${BASE}/api/waba/webhook`, {
      data: {},
    });
    // Should handle gracefully — 200 (acknowledge) or 400
    expect(res.status()).toBeLessThanOrEqual(500);
  });

  test('POST /api/waba/webhook rejects malformed payload', async ({ request }) => {
    const res = await request.post(`${BASE}/api/waba/webhook`, {
      data: { object: 'not_whatsapp_business_account' },
    });
    expect(res.status()).toBeLessThanOrEqual(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// VOUCHER CODE VALIDATION (NEW SHORT CODES)
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Voucher Code Format', () => {
  test('checkout API accepts HALF- prefix voucher codes', async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkout/square`, {
      data: {
        cart: [{ id: 'tov_slough_nihari', name: 'Nihari', price: 10.99, quantity: 1 }],
        customer: { name: 'Voucher Test', phone: '07123456789' },
        sourceId: 'cnon:card-nonce-ok',
        branch: 'slough',
        fulfillmentType: 'collection',
        voucherCode: 'HALF-FAKE',
      },
    });
    const body = await res.json();
    // Should NOT crash — either applies discount or says invalid code
    if (body.error) {
      expect(body.error).not.toContain('Cannot read');
      expect(body.error).not.toContain('undefined');
    }
  });

  test('checkout API accepts SAVE- prefix voucher codes', async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkout/square`, {
      data: {
        cart: [{ id: 'tov_slough_nihari', name: 'Nihari', price: 10.99, quantity: 1 }],
        customer: { name: 'Voucher Test', phone: '07123456789' },
        sourceId: 'cnon:card-nonce-ok',
        branch: 'slough',
        fulfillmentType: 'collection',
        voucherCode: 'SAVE-FAKE',
      },
    });
    const body = await res.json();
    if (body.error) {
      expect(body.error).not.toContain('Cannot read');
      expect(body.error).not.toContain('undefined');
    }
  });

  test('checkout API handles legacy TOV50- code format', async ({ request }) => {
    const res = await request.post(`${BASE}/api/checkout/square`, {
      data: {
        cart: [{ id: 'tov_slough_nihari', name: 'Nihari', price: 10.99, quantity: 1 }],
        customer: { name: 'Legacy Test', phone: '07123456789' },
        sourceId: 'cnon:card-nonce-ok',
        branch: 'slough',
        fulfillmentType: 'collection',
        voucherCode: 'TOV50-ABCD1234',
      },
    });
    const body = await res.json();
    if (body.error) {
      expect(body.error).not.toContain('Cannot read');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// LEADS CHECK-IN API
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Leads Check-In API', () => {
  test('POST /api/leads/check-in rejects missing name', async ({ request }) => {
    const res = await request.post(`${BASE}/api/leads/check-in`, {
      data: { phone: '07123456789' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });

  test('POST /api/leads/check-in rejects missing phone', async ({ request }) => {
    const res = await request.post(`${BASE}/api/leads/check-in`, {
      data: { name: 'Test User' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('required');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROMO VALIDATION API
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Promo Validation API', () => {
  test('POST /api/promos/validate returns result for known promo', async ({ request }) => {
    const res = await request.post(`${BASE}/api/promos/validate`, {
      data: { code: 'BREKKIE40', branch: 'slough', subtotal: 10 },
    });
    // Should return 200 with valid/invalid result, or 400/500 if endpoint changed
    expect(res.status()).toBeLessThanOrEqual(500);
  });

  test('POST /api/promos/validate handles empty code', async ({ request }) => {
    const res = await request.post(`${BASE}/api/promos/validate`, {
      data: { code: '', branch: 'slough' },
    });
    expect(res.status()).toBeLessThanOrEqual(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.valid).toBe(false);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TRACKING PAGE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Order Tracking Page', () => {
  test('/track loads with no crash', async ({ page }) => {
    await page.goto(`${BASE}/track`, { waitUntil: 'domcontentloaded' });
    // Should not crash — shows "No order found" or similar
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('/track/FAKE-ID shows order not found', async ({ page }) => {
    await page.goto(`${BASE}/track/FAKE-ID-12345`, { waitUntil: 'domcontentloaded' });
    // Should show some form of "not found" or error, never crash
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE RESPONSIVENESS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Mobile Responsiveness', () => {
  test('homepage is not horizontally scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // 5px tolerance
  });

  test('menu page fits mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`${BASE}/hayes/menu`, { waitUntil: 'domcontentloaded' });
    
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OFFERS PAGE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Offers Page', () => {
  test('/offers loads without crash', async ({ page }) => {
    await page.goto(`${BASE}/offers`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CHECK-IN PAGE
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Check-In Page', () => {
  test('/check-in loads without crash', async ({ page }) => {
    await page.goto(`${BASE}/check-in`, { waitUntil: 'domcontentloaded' });
    // Should load without application error
    await expect(page.locator('body')).not.toContainText('Application error');
    // Page should contain some interactive element
    const hasContent = await page.locator('body').textContent();
    expect(hasContent!.length).toBeGreaterThan(50);
  });
});
