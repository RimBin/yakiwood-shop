/**
 * Google Analytics 4 Event Tracking Utilities
 * 
 * This module provides type-safe event tracking for GA4.
 * Requires NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable.
 */

// Event types supported by GA4
export type AnalyticsEvent = 
  | 'page_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'purchase'
  | 'view_item'
  | 'search'
  | 'select_item'
  | 'generate_lead'
  | 'sign_up'
  | (string & {});

// Check if gtag is available
declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

function pushToDataLayer(payload: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  if (!window.dataLayer) return;
  try {
    window.dataLayer.push(payload);
  } catch {
    // ignore
  }
}

/**
 * Track a generic analytics event
 * @param event - The event name (e.g., 'page_view', 'add_to_cart')
 * @param params - Additional event parameters
 */
export function trackEvent(event: AnalyticsEvent, params?: Record<string, any>): void {
  if (typeof window !== 'undefined') {
    // GTM/GA4 via dataLayer
    if (window.dataLayer) {
      pushToDataLayer({ event, ...(params || {}) });
    }

    // Direct GA4 via gtag
    if (window.gtag) {
      window.gtag('event', event, params);
      return;
    }
  }

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', event, params);
  }
}

/**
 * Track add to cart event
 * @param product - Product details
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
}): void {
  trackEvent('add_to_cart', {
    currency: 'EUR',
    value: product.price * product.quantity,
    ecommerce: {
      currency: 'EUR',
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_variant: product.variant,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    },
  });
}

/**
 * Track remove from cart event
 * @param product - Product details
 */
export function trackRemoveFromCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
}): void {
  trackEvent('remove_from_cart', {
    currency: 'EUR',
    value: product.price * product.quantity,
    ecommerce: {
      currency: 'EUR',
      value: product.price * product.quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_variant: product.variant,
          price: product.price,
          quantity: product.quantity,
        },
      ],
    },
  });
}

/**
 * Track purchase/conversion event
 * @param orderId - Unique order identifier
 * @param total - Total order value
 * @param items - Array of purchased items
 */
export function trackPurchase(
  orderId: string,
  total: number,
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    variant?: string;
  }>
): void {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'EUR',
    value: total,
    ecommerce: {
      transaction_id: orderId,
      currency: 'EUR',
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
}

/**
 * Track search event
 * @param query - Search query string
 * @param resultCount - Number of results returned
 */
export function trackSearch(query: string, resultCount: number): void {
  trackEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
}

/**
 * Track product view event
 * @param product - Product details
 */
export function trackProductView(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  variant?: string;
}): void {
  trackEvent('view_item', {
    currency: 'EUR',
    value: product.price,
    ecommerce: {
      currency: 'EUR',
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_variant: product.variant,
          price: product.price,
        },
      ],
    },
  });
}

/**
 * Track begin checkout event
 * @param items - Cart items
 * @param total - Cart total value
 */
export function trackBeginCheckout(
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    category?: string;
    variant?: string;
  }>,
  total: number
): void {
  trackEvent('begin_checkout', {
    currency: 'EUR',
    value: total,
    ecommerce: {
      currency: 'EUR',
      value: total,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        price: item.price,
        quantity: item.quantity,
      })),
    },
  });
}

/**
 * Track select item event (when user clicks on a product)
 * @param product - Product details
 */
export function trackSelectItem(product: {
  id: string;
  name: string;
  price: number;
  category?: string;
  position?: number;
}): void {
  trackEvent('select_item', {
    ecommerce: {
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          index: product.position,
        },
      ],
    },
  });
}

/**
 * Track page view event
 * @param url - Page URL or path
 */
export function trackPageView(url: string): void {
  trackEvent('page_view', {
    page_path: url,
    page_location: typeof window !== 'undefined' ? window.location.href : url,
  });
}

export type PendingPurchaseItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  variant?: string;
};

export type PendingPurchase = {
  id: string;
  provider: 'stripe' | 'paypal' | 'paysera' | 'manual' | 'unknown';
  orderId?: string;
  sessionId?: string;
  total: number;
  currency: 'EUR';
  items: PendingPurchaseItem[];
  createdAt: number;
};

const PENDING_PURCHASE_KEY = 'yakiwood:pending_purchase:v1';
const PURCHASE_TRACKED_PREFIX = 'yakiwood:purchase_tracked:v1:';

export function savePendingPurchase(purchase: Omit<PendingPurchase, 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PendingPurchase = { ...purchase, createdAt: Date.now() };
    window.sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadPendingPurchase(): PendingPurchase | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPurchase;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.total !== 'number' || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPurchase(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PENDING_PURCHASE_KEY);
  } catch {
    // ignore
  }
}

export function isPurchaseTracked(key: string): boolean {
  if (typeof window === 'undefined') return false;
  if (!key) return false;
  try {
    return window.localStorage.getItem(PURCHASE_TRACKED_PREFIX + key) === '1';
  } catch {
    return false;
  }
}

export function markPurchaseTracked(key: string): void {
  if (typeof window === 'undefined') return;
  if (!key) return;
  try {
    window.localStorage.setItem(PURCHASE_TRACKED_PREFIX + key, '1');
  } catch {
    // ignore
  }
}
