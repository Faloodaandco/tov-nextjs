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

  test('GET /api/orders/nonexistent returns 404 (or 500 without Firebase credentials)', async ({ request }) => {
    const res = await request.get('/api/orders/nonexistent-order-id');
    expect([404, 500]).toContain(res.status());
  });

  test('POST /api/delivery/quote requires postcode', async ({ request }) => {
    const res = await request.post('/api/delivery/quote', {
      data: { branch: 'hayes' },
    });
    expect(res.status()).toBe(400);
  });

  // ─── Service Fee Rules ─────────────────────────────────────────

  test('Collection orders do not charge service fee, Delivery orders do', async ({ page }) => {
    // Deterministically seed cart with an item so test is resilient across viewports
    await page.addInitScript(() => {
      localStorage.setItem('tov_cart', JSON.stringify([
        { id: 'chicken_karahi', name: 'Chicken Karahi', price: 15.99, quantity: 1 }
      ]));
    });

    await page.goto('/slough/menu');

    // Open cart drawer via bottom floating cart bar
    const cartTrigger = page.locator('[data-testid="cart-floating-bar"], button:has-text("Review & Pay")').first();
    
    // If cart bar is not visible yet (e.g. hydration timing), click an item card to ensure cart has an item
    if (!(await cartTrigger.isVisible({ timeout: 2000 }).catch(() => false))) {
      const itemCard = page.locator('div[class*="group"][class*="cursor-pointer"]').first();
      if (await itemCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await itemCard.click();
        const regularBtn = page.locator('button:has-text("Regular")').first();
        if (await regularBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await regularBtn.click();
        }
      }
    }

    await cartTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await cartTrigger.click();

    // In the cart drawer, find the Collection and Delivery buttons
    const collectionBtn = page.locator('button:has-text("Collection")').first();
    const deliveryBtn = page.locator('button:has-text("Delivery")').first();
    await collectionBtn.waitFor({ state: 'visible', timeout: 5000 });

    // When Collection is selected, Service Fee should NOT be visible
    await collectionBtn.click();
    await expect(page.locator('text=Service Fee (10%)')).not.toBeVisible();

    // When Delivery is selected, Service Fee should be visible
    await deliveryBtn.click();
    await expect(page.locator('text=Service Fee (10%)')).toBeVisible();

    // Switch back to Collection — Service Fee must disappear again
    await collectionBtn.click();
    await expect(page.locator('text=Service Fee (10%)')).not.toBeVisible();
  });

  test('Proceeding to payment opens Square payment form without crashing', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('tov_cart', JSON.stringify([
        { id: 'chicken_karahi', name: 'Chicken Karahi', price: 15.99, quantity: 1 }
      ]));
    });

    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/slough/menu');

    const cartTrigger = page.locator('[data-testid="cart-floating-bar"], button:has-text("Review & Pay")').first();
    await cartTrigger.waitFor({ state: 'visible', timeout: 10000 });
    await cartTrigger.click();

    // Select Collection
    const collectionBtn = page.locator('button:has-text("Collection")').first();
    await collectionBtn.waitFor({ state: 'visible', timeout: 5000 });
    await collectionBtn.click();

    // Click checkout in cart drawer
    const checkoutBtn = page.locator('button:has-text("CHECKOUT")').last();
    await checkoutBtn.waitFor({ state: 'visible', timeout: 5000 });
    await checkoutBtn.click();

    // Dismiss upsell if present
    const upsellContinueBtn = page.locator('button:has-text("Continue to Details & Payment")').first();
    if (await upsellContinueBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await upsellContinueBtn.click();
    }

    // Fill customer info
    const nameInput = page.locator('input[placeholder*="John Doe"], input[placeholder*="Name" i]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('John Doe');

    const phoneInput = page.locator('input[placeholder*="07" i], input[type="tel"]').first();
    await phoneInput.fill('07123456789');

    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.fill('john.doe@example.com');

    // Click "Proceed to Payment"
    const proceedToPaymentBtn = page.locator('button:has-text("Proceed to Payment")').first();
    await proceedToPaymentBtn.waitFor({ state: 'attached', timeout: 5000 });
    await proceedToPaymentBtn.evaluate((el: HTMLElement) => el.click());

    // Verify Payment step is reached and page has NOT crashed
    const paymentHeading = page.locator('h3:has-text("Complete Payment")').first();
    await expect(paymentHeading).toBeVisible({ timeout: 10000 });

    // Ensure #square-card-container exists
    const squareContainer = page.locator('#square-card-container');
    await expect(squareContainer).toBeVisible();

    // Check that no fatal reference errors occurred
    const fatalErrors = pageErrors.filter(e => e.includes('is not defined'));
    expect(fatalErrors).toHaveLength(0);
  });
});
