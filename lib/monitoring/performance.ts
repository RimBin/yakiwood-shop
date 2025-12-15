/**
 * Performance Monitoring
 * 
 * Tracks Core Web Vitals and sends metrics to analytics.
 * Integrates with Google Analytics and custom monitoring solutions.
 */

export interface WebVitalsMetric {
  id: string;
  name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  sendToAnalytics(metric);

  // Check for performance issues
  checkPerformanceThresholds(metric);
}

/**
 * Send metrics to custom analytics endpoint
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: metric.name,
        value: metric.value,
        rating: metric.rating,
        url: window.location.pathname,
        timestamp: Date.now(),
      }),
      // Use keepalive to ensure request completes even if page is closing
      keepalive: true,
    });
  } catch (error) {
    // Silently fail - don't block user experience
    console.error('Failed to send analytics:', error);
  }
}

/**
 * Check if metrics exceed thresholds and log warnings
 */
function checkPerformanceThresholds(metric: WebVitalsMetric) {
  const thresholds = {
    FCP: 1800, // 1.8s
    LCP: 2500, // 2.5s
    CLS: 0.1,
    FID: 100, // 100ms
    TTFB: 800, // 800ms
    INP: 200, // 200ms
  };

  const threshold = thresholds[metric.name];
  
  if (metric.value > threshold) {
    console.warn(
      `[Performance Warning] ${metric.name} exceeded threshold:`,
      `${metric.value}${metric.name === 'CLS' ? '' : 'ms'} (threshold: ${threshold}${metric.name === 'CLS' ? '' : 'ms'})`
    );
  }
}

/**
 * Track custom performance metrics
 */
export function trackCustomMetric(name: string, value: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'custom_metric', {
      event_category: 'Performance',
      event_label: name,
      value: Math.round(value),
      non_interaction: true,
    });
  }
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string) {
  const startMark = `${componentName}-render-start`;
  const endMark = `${componentName}-render-end`;
  const measureName = `${componentName}-render`;

  return {
    start: () => {
      if (typeof performance !== 'undefined') {
        performance.mark(startMark);
      }
    },
    end: () => {
      if (typeof performance !== 'undefined') {
        performance.mark(endMark);
        performance.measure(measureName, startMark, endMark);
        
        const measure = performance.getEntriesByName(measureName)[0];
        if (measure) {
          trackCustomMetric(`render_${componentName}`, measure.duration);
          
          // Clean up marks and measures
          performance.clearMarks(startMark);
          performance.clearMarks(endMark);
          performance.clearMeasures(measureName);
        }
      }
    },
  };
}

/**
 * Track navigation timing
 */
export function trackNavigation() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navTiming) {
      // DNS lookup time
      trackCustomMetric('dns_time', navTiming.domainLookupEnd - navTiming.domainLookupStart);
      
      // Connection time
      trackCustomMetric('connection_time', navTiming.connectEnd - navTiming.connectStart);
      
      // Request time
      trackCustomMetric('request_time', navTiming.responseStart - navTiming.requestStart);
      
      // Response time
      trackCustomMetric('response_time', navTiming.responseEnd - navTiming.responseStart);
      
      // DOM processing time
      trackCustomMetric('dom_processing', navTiming.domComplete - navTiming.domLoading);
      
      // Load complete time
      trackCustomMetric('load_complete', navTiming.loadEventEnd - navTiming.loadEventStart);
    }
  });
}

/**
 * Track resource timing
 */
export function trackResources() {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const byType: Record<string, { count: number; totalSize: number; totalDuration: number }> = {};
  
  resources.forEach(resource => {
    const type = resource.initiatorType;
    
    if (!byType[type]) {
      byType[type] = { count: 0, totalSize: 0, totalDuration: 0 };
    }
    
    byType[type].count++;
    byType[type].totalSize += resource.transferSize || 0;
    byType[type].totalDuration += resource.duration;
  });
  
  // Log resource summary
  console.table(byType);
  
  // Track slow resources
  const slowResources = resources
    .filter(r => r.duration > 1000)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);
  
  if (slowResources.length > 0) {
    console.warn('[Slow Resources]', slowResources.map(r => ({
      name: r.name,
      duration: Math.round(r.duration) + 'ms',
      size: formatBytes(r.transferSize),
    })));
  }
}

/**
 * Monitor long tasks (> 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Long tasks are those that block the main thread for > 50ms
        console.warn('[Long Task]', {
          duration: Math.round(entry.duration) + 'ms',
          startTime: Math.round(entry.startTime) + 'ms',
        });
        
        trackCustomMetric('long_task', entry.duration);
      }
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // PerformanceObserver not supported or entryType not available
    console.log('Long task monitoring not supported');
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  if (typeof window === 'undefined') return null;

  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalRequests = resources.length;
  
  return {
    navigation: navTiming ? {
      dns: Math.round(navTiming.domainLookupEnd - navTiming.domainLookupStart),
      connection: Math.round(navTiming.connectEnd - navTiming.connectStart),
      ttfb: Math.round(navTiming.responseStart - navTiming.requestStart),
      domLoad: Math.round(navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart),
      windowLoad: Math.round(navTiming.loadEventEnd - navTiming.loadEventStart),
    } : null,
    resources: {
      total: totalRequests,
      totalSize: formatBytes(totalSize),
    },
  };
}

/**
 * Format bytes helper
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track navigation timing
  trackNavigation();
  
  // Monitor long tasks
  monitorLongTasks();
  
  // Log performance summary after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const summary = getPerformanceSummary();
      console.log('[Performance Summary]', summary);
      
      // Track resources
      if (process.env.NODE_ENV === 'development') {
        trackResources();
      }
    }, 1000);
  });
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
