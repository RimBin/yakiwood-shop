import { test, expect } from '@playwright/test';
import { addToCart } from './utils/helpers';

type CartItemConfiguration = {
  usageType?: string;
  sku?: string;
  profileVariantId?: string;
  colorVariantId?: string;
  thicknessOptionId?: string;
  thicknessMm?: number;
  widthMm?: number;
  lengthMm?: number;
};

type CartItem = {
  lineId: string;
  id: string;
  name: string;
  slug: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
  configuration?: CartItemConfiguration;
  configurationId?: string;
  addedAt?: number;
};

function createLineId(item: {
  id: string;
  color?: string;
  finish?: string;
  configuration?: CartItemConfiguration;
  configurationId?: string;
}): string {
  const cfg = item.configuration;
  const parts = [
    item.id,
    item.color ?? '',
    item.finish ?? '',
    cfg?.usageType ?? '',
    cfg?.sku ?? '',
    cfg?.profileVariantId ?? '',
    cfg?.colorVariantId ?? '',
    cfg?.thicknessOptionId ?? '',
    typeof cfg?.thicknessMm === 'number' ? String(cfg.thicknessMm) : '',
    typeof cfg?.widthMm === 'number' ? String(cfg.widthMm) : '',
    typeof cfg?.lengthMm === 'number' ? String(cfg.lengthMm) : '',
    item.configurationId ?? '',
  ];
  return parts.join('|');
}

async function seedCart(page: any, items: CartItem[]) {
  await page.addInitScript(({ items }: { items: CartItem[] }) => {
    localStorage.setItem(
      'yakiwood-cart',
      JSON.stringify({
        state: {
          items,
        },
        version: 3,
      })
    );
  }, { items });
}

async function fillRequiredCheckoutFields(page: any) {
  // Contact
  await page.locator('input[type="email"]').fill('demo@example.com');
  await page.locator('input[type="tel"]').fill('+37060000000');

  // Required text inputs (full name + delivery fields)
  const requiredTextInputs = page.locator(
    'input[required]:not([type="email"]):not([type="tel"]):not([type="radio"]):not([disabled])'
  );
  await expect(requiredTextInputs).toHaveCount(5);

  await requiredTextInputs.nth(0).fill('Demo Pirkėjas');
  await requiredTextInputs.nth(1).fill('Lietuva');
  await requiredTextInputs.nth(2).fill('Vilnius');
  await requiredTextInputs.nth(3).fill('Gedimino pr. 1');
  await requiredTextInputs.nth(4).fill('01103');

  // Terms
  await page.locator('#terms').check();
}

test.describe('Purchase flows (demo)', () => {
  test('cart -> checkout -> order-confirmation (demo)', async ({ page }) => {
    const now = Date.now();
    const item: CartItem = {
      id: 'demo-product-1',
      name: 'Demo produktas',
      slug: 'demo-product',
      quantity: 1,
      basePrice: 99,
      addedAt: now,
      lineId: createLineId({ id: 'demo-product-1' }),
    };

    await seedCart(page, [item]);

    await page.goto('/checkout');
    await expect(page.locator('form')).toBeVisible();

    await fillRequiredCheckoutFields(page);

    await Promise.all([
      page.waitForURL(/\/order-confirmation\?session_id=demo_/, { timeout: 20000 }),
      page.locator('button[type="submit"]').click(),
    ]);

    await expect(page.getByRole('heading', { name: /Dėkojame už užsakymą/i })).toBeVisible();
  });

  test('checkout preserves configured dimensions and completes (demo)', async ({ page }) => {
    const now = Date.now();
    const item: CartItem = {
      id: 'demo-product-2',
      name: 'Demo lentos',
      slug: 'demo-boards',
      quantity: 2,
      basePrice: 120,
      addedAt: now,
      configuration: {
        widthMm: 120,
        lengthMm: 2000,
      },
      lineId: createLineId({ id: 'demo-product-2', configuration: { widthMm: 120, lengthMm: 2000 } }),
    };

    await seedCart(page, [item]);

    await page.goto('/checkout');
    await expect(page.locator('form')).toBeVisible();

    // Width/length inputs should be prefilled from the cart configuration
    const numberInputs = page.locator('input[type="number"]');
    await expect(numberInputs.nth(0)).toHaveValue('120');
    await expect(numberInputs.nth(1)).toHaveValue('2000');

    await fillRequiredCheckoutFields(page);

    await Promise.all([
      page.waitForURL(/\/order-confirmation\?session_id=demo_/, { timeout: 20000 }),
      page.locator('button[type="submit"]').click(),
    ]);

    await expect(page.getByRole('heading', { name: /Dėkojame už užsakymą/i })).toBeVisible();
  });

  test('product page add-to-cart -> checkout -> order-confirmation (demo)', async ({ page }) => {
    await page.goto('/');

    // Use an existing product route used by other tests
    await addToCart(page, 'shou-sugi-ban-wood');

    await page.goto('/checkout');
    await expect(page.locator('form')).toBeVisible();

    await fillRequiredCheckoutFields(page);

    await Promise.all([
      page.waitForURL(/\/order-confirmation\?session_id=demo_/, { timeout: 20000 }),
      page.locator('button[type="submit"]').click(),
    ]);

    await expect(page.getByRole('heading', { name: /Dėkojame už užsakymą/i })).toBeVisible();
  });
});
