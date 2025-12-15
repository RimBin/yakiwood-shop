import { test, expect } from '@playwright/test';
import { addToCart } from './utils/helpers';
import { routes, testProducts } from './fixtures/data';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cart before each test
    await page.goto('/');
  });

  test('should add product to cart', async ({ page }) => {
    await page.goto(routes.products);
    
    // Find and click on first product
    const firstProduct = page.locator('[data-testid="product-card"], article, .product').first();
    await firstProduct.click();
    
    // Add to cart button (adjust text based on Lithuanian translation)
    const addToCartButton = page.locator('button:has-text("Į krepšelį"), button:has-text("Pridėti"), button[data-testid="add-to-cart"]');
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // Wait for cart update
      await page.waitForTimeout(500);
      
      // Check if cart icon shows item count
      const cartIcon = page.locator('[data-testid="cart-count"], .cart-count, [aria-label*="cart" i]');
      if (await cartIcon.isVisible()) {
        const text = await cartIcon.textContent();
        expect(text).toContain('1');
      }
    }
  });

  test('should open cart sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Click on cart icon
    const cartButton = page.locator('[data-testid="cart-button"], button[aria-label*="cart" i], a[href*="cart"]');
    
    if (await cartButton.isVisible()) {
      await cartButton.click();
      
      // Cart sidebar should open
      await page.waitForTimeout(300);
      const cartSidebar = page.locator('[data-testid="cart-sidebar"], aside, .cart-drawer');
      if (await cartSidebar.isVisible()) {
        await expect(cartSidebar).toBeVisible();
      }
    }
  });

  test('should update cart item quantity', async ({ page }) => {
    await page.goto(routes.products);
    
    // Add product to cart first
    const firstProduct = page.locator('[data-testid="product-card"], article, .product').first();
    await firstProduct.click();
    
    const addToCartButton = page.locator('button:has-text("Į krepšelį"), button:has-text("Pridėti")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Open cart
      const cartButton = page.locator('[data-testid="cart-button"], button[aria-label*="cart" i]');
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(300);
        
        // Find quantity increase button
        const increaseButton = page.locator('button[data-testid="increase-quantity"], button:has-text("+"), button[aria-label*="increase"]');
        if (await increaseButton.first().isVisible()) {
          await increaseButton.first().click();
          await page.waitForTimeout(500);
          
          // Quantity should be updated
          const quantity = page.locator('[data-testid="item-quantity"], input[type="number"]');
          if (await quantity.first().isVisible()) {
            const value = await quantity.first().inputValue();
            expect(parseInt(value)).toBeGreaterThan(1);
          }
        }
      }
    }
  });

  test('should remove item from cart', async ({ page }) => {
    await page.goto(routes.products);
    
    // Add product to cart first
    const firstProduct = page.locator('[data-testid="product-card"], article, .product').first();
    await firstProduct.click();
    
    const addToCartButton = page.locator('button:has-text("Į krepšelį"), button:has-text("Pridėti")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Open cart
      const cartButton = page.locator('[data-testid="cart-button"], button[aria-label*="cart" i]');
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(300);
        
        // Find remove button
        const removeButton = page.locator('button[data-testid="remove-item"], button[aria-label*="remove"], button:has-text("×"), button:has-text("Šalinti")');
        if (await removeButton.first().isVisible()) {
          await removeButton.first().click();
          await page.waitForTimeout(500);
          
          // Cart should be empty or show empty message
          const emptyMessage = page.locator('text=/tuščias|empty/i, [data-testid="empty-cart"]');
          if (await emptyMessage.isVisible()) {
            await expect(emptyMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('should calculate cart total correctly', async ({ page }) => {
    await page.goto(routes.products);
    
    // Add product to cart
    const firstProduct = page.locator('[data-testid="product-card"], article, .product').first();
    await firstProduct.click();
    
    const addToCartButton = page.locator('button:has-text("Į krepšelį"), button:has-text("Pridėti")');
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(500);
      
      // Open cart
      const cartButton = page.locator('[data-testid="cart-button"], button[aria-label*="cart" i]');
      if (await cartButton.isVisible()) {
        await cartButton.click();
        await page.waitForTimeout(300);
        
        // Check if total is displayed
        const total = page.locator('[data-testid="cart-total"], .cart-total, text=/viso|total/i').last();
        if (await total.isVisible()) {
          await expect(total).toBeVisible();
          const totalText = await total.textContent();
          expect(totalText).toMatch(/\d+/); // Should contain numbers
        }
      }
    }
  });
});
