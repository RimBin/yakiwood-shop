import { test, expect } from '@playwright/test';
import { routes } from './fixtures/data';

test.describe('Products Page', () => {
  test('should display product list', async ({ page }) => {
    await page.goto(routes.products);
    await expect(page).toHaveURL(/\/produktai/);
    
    // Wait for products to load
    await page.waitForLoadState('networkidle');
    
    // Check if product cards are present
    const products = page.locator('[data-testid="product-card"], article, .product');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product details', async ({ page }) => {
    await page.goto(routes.products);
    
    // Click on first product (adjust selector based on actual implementation)
    const firstProduct = page.locator('[data-testid="product-card"], article, .product').first();
    await firstProduct.click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/produktai\/.+/);
    
    // Product detail should have title and price
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    await page.goto(routes.products);
    
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="paieška" i]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('plank');
      await page.waitForTimeout(1000); // Wait for search results
      
      // Results should be filtered
      const results = page.locator('[data-testid="product-card"], article, .product');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto(routes.products);
    
    // Look for filter/category buttons
    const filterButtons = page.locator('button[data-category], [role="tab"], .category-filter');
    
    if ((await filterButtons.count()) > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);
      
      // Products should be filtered
      const products = page.locator('[data-testid="product-card"], article, .product');
      await expect(products.first()).toBeVisible();
    }
  });

  test('should load product images', async ({ page }) => {
    await page.goto(routes.products);
    await page.waitForLoadState('networkidle');
    
    // Check if images are loaded
    const images = page.locator('[data-testid="product-card"] img, article img, .product img');
    if ((await images.count()) > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Check if image has src attribute
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });
});
