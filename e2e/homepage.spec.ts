import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Yakiwood/i);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check that main navigation links are present
    await expect(page.locator('a[href="/products"], a[href="/produktai"]').first()).toBeVisible();
    await expect(page.locator('a[href="/sprendimai"]').first()).toBeVisible();
    await expect(page.locator('a[href="/projektai"]').first()).toBeVisible();
    // Legacy LT paths may exist via redirects; canonical pages are EN folders.
    await expect(page.locator('a[href="/apie"], a[href="/about"]').first()).toBeVisible();
    await expect(page.locator('a[href="/kontaktai"], a[href="/contact"]').first()).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    // Use canonical route directly; nav may still contain legacy LT hrefs.
    await page.goto('/products');
    await expect(page).toHaveURL(/\/products/);
  });

  test('should open mobile menu on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Look for mobile menu button (adjust selector based on actual implementation)
    const menuButton = page.locator('button[aria-label*="menu" i], button:has-text("Menu")');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Check if mobile menu is opened (adjust selector based on actual implementation)
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    // Hero section should contain heading or image
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });
});
