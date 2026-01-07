import { test, expect } from '@playwright/test';

test.describe('Shou Sugi Ban configurator', () => {
  test('product page loads with 2D visible and 3D not loaded by default', async ({ page }) => {
    await page.goto('/products/shou-sugi-ban-wood');

    await expect(page.locator('[data-testid="configurator-2d-image"]')).toBeVisible();
    await expect(page.locator('[data-testid="configurator-3d-canvas"]')).toHaveCount(0);
  });

  test('toggle to 3D shows canvas', async ({ page }) => {
    await page.goto('/products/shou-sugi-ban-wood');

    await page.click('[data-testid="configurator-toggle-view"]');
    await expect(page.locator('[data-testid="configurator-3d-canvas"]')).toBeVisible();
  });

  test('selecting options updates config summary', async ({ page }) => {
    await page.goto('/products/shou-sugi-ban-wood');

    await page.click('[data-testid="option-wood-larch"]');
    await page.click('[data-testid="option-usage-terrace"]');
    await page.click('[data-testid="option-color-black"]');
    await page.click('[data-testid="option-profile-P4"]');

    const summary = page.locator('[data-testid="configurator-summary"]');
    await expect(summary).toContainText('"wood": "larch"');
    await expect(summary).toContainText('"usage": "terrace"');
    await expect(summary).toContainText('"color": "black"');
    await expect(summary).toContainText('"profile": "P4"');
  });

  test('preset landing CTA opens product with preset and preselects options', async ({ page }) => {
    await page.goto('/shou-sugi-ban/accoya-black');

    await page.click('[data-testid="variant-cta"]');
    await expect(page).toHaveURL(/\/products\/shou-sugi-ban-wood\?preset=accoya-black/);

    const summary = page.locator('[data-testid="configurator-summary"]');
    await expect(summary).toContainText('"wood": "accoya"');
    await expect(summary).toContainText('"color": "black"');
    await expect(summary).toContainText('"preset": "accoya-black"');
  });
});
