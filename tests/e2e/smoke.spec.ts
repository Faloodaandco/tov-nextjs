import { test, expect } from '@playwright/test';

test.describe('TOV Smoke Tests', () => {
  // ─── Branch Routing ──────────────────────────────────────────────

  test('homepage loads and shows branch selection', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/taste of village/i);
  });

  test('/hayes/menu loads menu page', async ({ page }) => {
    await page.goto('/hayes/menu');
    await expect(page.locator('body')).toContainText(/menu/i);
  });

  test('/slough/menu loads menu page', async ({ page }) => {
    await page.goto('/slough/menu');
    await expect(page.locator('body')).toContainText(/menu/i);
  });

  // ─── Redirects ───────────────────────────────────────────────────

  test('/order redirects to /hayes/menu', async ({ page }) => {
    await page.goto('/order');
    await page.waitForURL('**/hayes/menu');
    expect(page.url()).toContain('/hayes/menu');
  });

  test('/hayes/order redirects to /hayes/menu', async ({ page }) => {
    await page.goto('/hayes/order');
    await page.waitForURL('**/hayes/menu');
    expect(page.url()).toContain('/hayes/menu');
  });

  // ─── Static Pages ───────────────────────────────────────────────

  test('/book loads booking page', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('/privacy loads privacy page', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('body')).not.toContainText('404');
  });

  test('/review loads review page', async ({ page }) => {
    await page.goto('/review');
    await expect(page.locator('body')).not.toContainText('404');
  });

  // ─── API Routes ─────────────────────────────────────────────────

  test('POST /api/checkout/square rejects empty cart', async ({ request }) => {
    const res = await request.post('/api/checkout/square', {
      data: { cart: [], customer: { name: 'Test', phone: '07000000000' }, sourceId: 'tok_test' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Cart cannot be empty');
  });

  test('POST /api/checkout/square rejects unknown menu item', async ({ request }) => {
    const res = await request.post('/api/checkout/square', {
      data: {
        cart: [{ id: 'FAKE_ITEM_999', name: 'Hacked Burger', price: 0, quantity: 1 }],
        customer: { name: 'Test', phone: '07000000000' },
        sourceId: 'tok_test',
        branch: 'hayes',
      },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('Unknown menu item');
  });

  test('GET /api/orders/nonexistent returns 404', async ({ request }) => {
    const res = await request.get('/api/orders/nonexistent-order-id');
    expect(res.status()).toBe(404);
  });

  test('POST /api/delivery/quote requires postcode', async ({ request }) => {
    const res = await request.post('/api/delivery/quote', {
      data: { branch: 'hayes' },
    });
    expect(res.status()).toBe(400);
  });

  // ─── Webhook Security ──────────────────────────────────────────

  test('POST /api/webhooks/square rejects unsigned request', async ({ request }) => {
    const res = await request.post('/api/webhooks/square', {
      data: { type: 'payment.completed', data: {} },
    });
    // Expect either 500 (no keys configured) or 401 (invalid signature)
    expect([401, 500]).toContain(res.status());
  });
});
