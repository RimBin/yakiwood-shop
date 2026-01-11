/**
 * Prefetching Utilities
 * 
 * Improves perceived performance by prefetching routes and resources
 * before they're needed.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

/**
 * Prefetch multiple routes on mount
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();
  
  useEffect(() => {
    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [routes, router]);
}

/**
 * Prefetch on hover
 * Returns event handlers to attach to links
 */
export function usePrefetchOnHover(route: string) {
  const router = useRouter();
  
  const handleMouseEnter = useCallback(() => {
    router.prefetch(route);
  }, [route, router]);
  
  const handleTouchStart = useCallback(() => {
    router.prefetch(route);
  }, [route, router]);
  
  return {
    onMouseEnter: handleMouseEnter,
    onTouchStart: handleTouchStart,
  };
}

/**
 * Prefetch important routes based on current page
 */
export function usePrefetchBasedOnPage(currentPath: string) {
  const router = useRouter();
  
  useEffect(() => {
    const routesToPrefetch: string[] = [];
    
    // Homepage - prefetch main sections
    if (currentPath === '/') {
      routesToPrefetch.push('/produktai', '/sprendimai', '/projektai');
    }
    
    // Products page - prefetch common product details
    if (currentPath === '/produktai') {
      routesToPrefetch.push('/produktai/burnt-wood-plank', '/produktai/burnt-wood-panel');
    }
    
    // Product detail - prefetch related products and checkout
    if (currentPath.startsWith('/produktai/')) {
      routesToPrefetch.push('/checkout', '/produktai');
    }
    
    // Always prefetch common routes
    routesToPrefetch.push('/kontaktai', '/apie');
    
    routesToPrefetch.forEach(route => router.prefetch(route));
  }, [currentPath, router]);
}

/**
 * Prefetch on scroll (for paginated content)
 */
export function usePrefetchOnScroll(
  nextPageRoute: string | null,
  threshold: number = 0.8
) {
  const router = useRouter();
  
  useEffect(() => {
    if (!nextPageRoute) return;
    
    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const percentage = scrolled / total;
      
      if (percentage > threshold) {
        router.prefetch(nextPageRoute);
        // Remove listener after prefetching
        window.removeEventListener('scroll', handleScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nextPageRoute, threshold, router]);
}

/**
 * Prefetch with IntersectionObserver
 * Prefetches when element comes into viewport
 */
export function usePrefetchOnVisible(
  route: string,
  enabled: boolean = true
) {
  const router = useRouter();
  
  useEffect(() => {
    if (!enabled || typeof IntersectionObserver === 'undefined') return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            router.prefetch(route);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start prefetching 50px before entering viewport
      }
    );
    
    // This would need to be attached to a specific element
    // Example usage in component:
    // const ref = useRef<HTMLDivElement>(null);
    // usePrefetchOnVisible(route, ref);
    
    return () => observer.disconnect();
  }, [route, enabled, router]);
}

/**
 * Prefetch image
 */
export function prefetchImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Prefetch multiple images
 */
export async function prefetchImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(prefetchImage));
}

/**
 * Hook to prefetch images on mount
 */
export function usePrefetchImages(srcs: string[]) {
  useEffect(() => {
    prefetchImages(srcs).catch(error => {
      console.warn('Failed to prefetch images:', error);
    });
  }, [srcs]);
}

/**
 * Prefetch API response
 */
export async function prefetchAPI(endpoint: string): Promise<void> {
  try {
    const response = await fetch(endpoint);
    await response.json();
  } catch (error) {
    console.warn('Failed to prefetch API:', error);
  }
}

/**
 * Prefetch with priority queue
 */
class PrefetchQueue {
  private queue: Array<{ route: string; priority: number }> = [];
  private processing = false;
  
  add(route: string, priority: number = 0) {
    this.queue.push({ route, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }
  
  private async process() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        // In a real implementation, use router.prefetch
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.processing = false;
  }
}

export const prefetchQueue = new PrefetchQueue();

/**
 * Smart prefetch - only on fast connections
 */
export function shouldPrefetch(): boolean {
  if (typeof navigator === 'undefined') return true;
  
  // Check connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    // Don't prefetch on slow connections (2G, slow-2g)
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return false;
    }
    
    // Don't prefetch if user has data saver enabled
    if (connection.saveData) {
      return false;
    }
  }
  
  return true;
}

/**
 * Conditional prefetch hook
 */
export function useSmartPrefetch(routes: string[]) {
  const router = useRouter();
  
  useEffect(() => {
    if (!shouldPrefetch()) {
      console.log('Skipping prefetch due to connection constraints');
      return;
    }
    
    routes.forEach(route => router.prefetch(route));
  }, [routes, router]);
}

/**
 * Prefetch related products
 */
export function usePrefetchRelatedProducts(productIds: string[]) {
  const router = useRouter();
  
  useEffect(() => {
    if (!shouldPrefetch()) return;
    
    // Prefetch first 3 related products
    productIds.slice(0, 3).forEach(id => {
      router.prefetch(`/produktai/${id}`);
    });
  }, [productIds, router]);
}
