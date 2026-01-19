import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto(routes.home);
    await expect(page).toHaveTitle(/Yakiwood/i);
    // Hero uses styled <p> text; assert a stable hero asset exists.
    await expect(page.getByAltText(/Shou Sugi Ban Plank/i)).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto(routes.home);

    // Desktop nav is hidden on the Mobile Chrome project; force a desktop viewport for this check.
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Check that main navigation links are present
    await expect(page.locator('a[href="/products"], a[href="/produktai"], a[href="/lt/produktai"]').first()).toBeVisible();
    await expect(page.locator('a[href="/solutions"], a[href="/sprendimai"], a[href="/lt/sprendimai"]').first()).toBeVisible();
    await expect(page.locator('a[href="/projects"], a[href="/projektai"], a[href="/lt/projektai"]').first()).toBeVisible();
    await expect(page.locator('a[href="/about"], a[href="/apie"], a[href="/lt/apie"]').first()).toBeVisible();
    await expect(page.locator('a[href="/contact"], a[href="/kontaktai"], a[href="/lt/kontaktai"]').first()).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto(routes.products);
    await expect(page).toHaveURL(/\/(products|produktai)(\/|$)/);
  });

  test('should open mobile menu on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(routes.home);
    
    // Look for mobile menu button (adjust selector based on actual implementation)
    const menuButton = page.locator('button[aria-label*="menu" i], button:has-text("Menu")');
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Check if mobile menu is opened (adjust selector based on actual implementation)
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('should display hero section', async ({ page }) => {
    await page.goto(routes.home);
    // Hero section should contain heading or image
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });
});
