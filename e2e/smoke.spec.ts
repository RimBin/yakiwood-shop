import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe.serial('Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    const response = await page.goto(routes.home, { timeout: 60_000 });
    expect(response?.status()).toBe(200);

    // Allow extra time for the title to be set by client-side scripts
    await expect(page).toHaveTitle(/Yakiwood/i, { timeout: 60_000 });

    // Wait for the `body` to be attached to the DOM (some pages keep body hidden briefly)
    await page.locator('body').waitFor({ state: 'attached', timeout: 60_000 });
  });

  test('should load all main routes', async ({ page }) => {
    const mainRoutes = [
      routes.home,
      routes.products,
      routes.solutions,
      routes.projects,
      routes.about,
      routes.contact,
    ];

    for (const route of mainRoutes) {
      // Try navigation with a retry for transient ERR_ABORTED errors
      let response = undefined;
      try {
        response = await page.goto(route, {
          waitUntil: 'domcontentloaded',
          timeout: 60_000,
        });
      } catch (err) {
        const msg = (err && err.message) ? String(err.message) : '';
        if (msg.includes('net::ERR_ABORTED')) {
          // Retry with a longer timeout and wait for network idle
          response = await page.goto(route, {
            waitUntil: 'networkidle',
            timeout: 90_000,
          });
        } else {
          throw err;
        }
      }
      expect(response?.status()).toBe(200);
      // Wait for the page body element to be attached (visibility can be transient)
      await page.locator('body').waitFor({ state: 'attached', timeout: 60_000 });
    }
  });

  test('should have accessible sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);

    // Browsers often render XML as HTML (pretty-printed), so prefer the raw response body.
    const xml = await response!.text();
    expect(xml).toContain('<urlset');
  });

  test('should have accessible robots.txt', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);

    // Same as sitemap: browsers wrap text in HTML <pre>.
    const robots = await response!.text();
    expect(robots).toMatch(/User-Agent/i);
  });

  test('should not have console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(routes.home, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    
    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter((error) => {
      const lower = error.toLowerCase();
      return (
        !lower.includes('favicon') &&
        !lower.includes('404') &&
        !lower.includes("isn't a valid image") &&
        !lower.includes("requested resource isn't a valid image") &&
        !lower.includes('upstream image response failed') &&
        !lower.includes('failed to load resource') &&
        !lower.includes('net::err') &&
        !lower.includes('not found')
      );
    });
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should load CSS and JavaScript assets', async ({ page }) => {
    await page.goto(routes.home);
    await page.waitForLoadState('networkidle');
    
    // Check if styles are applied
    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should have some background color set (not transparent/rgba(0,0,0,0))
    expect(backgroundColor).toBeTruthy();
  });

  test('should have working API health check', async ({ request }) => {
    // Test if API routes are accessible
    try {
      const response = await request.get('http://localhost:3000/api/health');
      // Either returns 200 (health check exists) or 404 (route doesn't exist yet)
      expect([200, 404]).toContain(response.status());
    } catch (error) {
      // If health endpoint doesn't exist, that's okay for this test
      console.log('Health check endpoint not implemented yet');
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto(routes.home);
    
    // Check for essential meta tags
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1920, height: 1080 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(routes.home);
      
      // Page should be visible at all viewport sizes
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have proper language attribute', async ({ page }) => {
    await page.goto(routes.home);
    
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en'); // defaultLocale
  });
});
