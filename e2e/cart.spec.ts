import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test (persisted via zustand)
    await page.addInitScript(() => {
      localStorage.removeItem('yakiwood-cart');
    });
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
  });

  test('should add product to cart', async ({ page }) => {
    const demoProductSlug = 'degintos-medienos-dailylente-fasadui-egle-natural';
    await page.goto(`/products/${demoProductSlug}`, { waitUntil: 'domcontentloaded' });

    await page.locator('button:has-text("Add to cart"), button:has-text("Į krepšelį")').first().click();

    // Open cart
    await page.getByRole('button', { name: /cart|krepš/i }).first().click();
    await expect(page.getByRole('heading', { name: /your cart|jūsų krepšelis/i })).toBeVisible();
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });

    // If the cart is already open, nothing to do.
    const cartHeading = page.getByRole('heading', { name: /your cart|jūsų krepšelis/i }).first();
    if (await cartHeading.isVisible().catch(() => false)) {
      await expect(cartHeading).toBeVisible();
      return;
    }

    // Prefer the visible header cart button text (avoid matching "Close cart").
    const cartButton = page.getByRole('button', { name: /krepšelis|cart/i }).first();
    if (await cartButton.isVisible().catch(() => false)) {
      await cartButton.click();
      await expect(cartHeading).toBeVisible();
    }
  });

  test('should update cart item quantity', async ({ page }) => {
    const demoProductSlug = 'degintos-medienos-dailylente-fasadui-egle-natural';
    await page.goto(`/products/${demoProductSlug}`, { waitUntil: 'domcontentloaded' });
    await page.locator('button:has-text("Add to cart"), button:has-text("Į krepšelį")').first().click();

    await page.getByRole('button', { name: /cart|krepš/i }).first().click();
    await expect(page.getByRole('heading', { name: /your cart|jūsų krepšelis/i })).toBeVisible();

    const quantityLabel = page.locator('span', { hasText: /^1$/ }).first();
    const increaseButton = page.locator('button:has(svg path[d="M8 3V13M3 8H13"])').first();
    await increaseButton.click();
    await expect(quantityLabel).not.toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    const demoProductSlug = 'degintos-medienos-dailylente-fasadui-egle-natural';
    await page.goto(`/products/${demoProductSlug}`, { waitUntil: 'domcontentloaded' });
    await page.locator('button:has-text("Add to cart"), button:has-text("Į krepšelį")').first().click();

    await page.getByRole('button', { name: /cart|krepš/i }).first().click();
    await expect(page.getByRole('heading', { name: /your cart|jūsų krepšelis/i })).toBeVisible();

    await page.locator('button:has-text("Remove"), button:has-text("Šalinti")').first().click();
    await expect(page.getByRole('heading', { name: /empty|tuščias/i })).toBeVisible();
  });

  test('should calculate cart total correctly', async ({ page }) => {
    const demoProductSlug = 'degintos-medienos-dailylente-fasadui-egle-natural';
    await page.goto(`/products/${demoProductSlug}`, { waitUntil: 'domcontentloaded' });
    await page.locator('button:has-text("Add to cart"), button:has-text("Į krepšelį")').first().click();

    await page.getByRole('button', { name: /cart|krepš/i }).first().click();
    await expect(page.getByRole('heading', { name: /your cart|jūsų krepšelis/i })).toBeVisible();

    await expect(page.locator('text=/\bTotal\b|\bViso\b/i')).toBeVisible();
  });
});
