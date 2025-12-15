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
  | 'select_item';

// Check if gtag is available
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Track a generic analytics event
 * @param event - The event name (e.g., 'page_view', 'add_to_cart')
 * @param params - Additional event parameters
 */
export function trackEvent(event: AnalyticsEvent, params?: Record<string, any>): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params);
  } else {
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, params);
    }
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
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.variant,
      price: item.price,
      quantity: item.quantity,
    })),
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
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        item_variant: product.variant,
        price: product.price,
      },
    ],
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
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.variant,
      price: item.price,
      quantity: item.quantity,
    })),
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
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        index: product.position,
      },
    ],
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
