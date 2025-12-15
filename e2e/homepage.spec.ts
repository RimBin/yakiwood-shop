import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Yakiwood/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Check that main navigation links are present
    await expect(page.locator('a[href="/produktai"]')).toBeVisible();
    await expect(page.locator('a[href="/sprendimai"]')).toBeVisible();
    await expect(page.locator('a[href="/projektai"]')).toBeVisible();
    await expect(page.locator('a[href="/apie"]')).toBeVisible();
    await expect(page.locator('a[href="/kontaktai"]')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/produktai"]');
    await expect(page).toHaveURL(/\/produktai/);
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
