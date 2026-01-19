import { Page } from '@playwright/test';

/**
 * Helper function to login a user
 * @param page - Playwright page object
 * @param email - User email
 * @param password - User password
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

async function clickAddToCartButton(page: Page): Promise<void> {
  const addToCart = page
    .locator(
      [
        'button[data-testid="add-to-cart"]',
        'button:has-text("Add to cart")',
        'button:has-text("Į krepšelį")',
        'button:has-text("Pridėti")',
      ].join(', ')
    )
    .first();

  await addToCart.waitFor({ state: 'visible', timeout: 10000 });
  await addToCart.click();
}

/**
 * Helper function to add a product to cart
 * @param page - Playwright page object
 * @param productSlug - Product slug/identifier
 */
export async function addToCart(page: Page, productSlug: string): Promise<void> {
  await page.goto(`/products/${productSlug}`);
  await clickAddToCartButton(page);
  await page.waitForTimeout(500); // Wait for cart update
}

/**
 * Helper function to navigate to a specific route
 * @param page - Playwright page object
 * @param route - Route path
 */
export async function navigateTo(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}

/**
 * Helper function to check if element is visible
 * @param page - Playwright page object
 * @param selector - CSS selector
 */
export async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
