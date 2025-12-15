# Performance Optimization Guide

## Overview

This guide covers performance optimization strategies for the Yakiwood e-commerce platform, focusing on Core Web Vitals, bundle optimization, and user experience improvements.

## Core Web Vitals Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | Time until the largest content element is rendered |
| **FID** (First Input Delay) | < 100ms | Time from user interaction to browser response |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability - measures unexpected layout shifts |
| **FCP** (First Contentful Paint) | < 1.8s | Time until first content is rendered |
| **TTI** (Time to Interactive) | < 3.8s | Time until page is fully interactive |

## Current Performance Status

### Baseline Metrics (Pre-Optimization)
Run `npm run audit:performance` to generate current metrics.

### Target Metrics (Post-Optimization)

| Page | Performance | LCP | CLS | FCP |
|------|-------------|-----|-----|-----|
| Homepage | 90+ | < 2.0s | < 0.05 | < 1.5s |
| Product List | 85+ | < 2.5s | < 0.1 | < 1.8s |
| Product Detail | 85+ | < 2.5s | < 0.1 | < 1.8s |
| Checkout | 85+ | < 2.5s | < 0.1 | < 1.8s |

## Optimization Strategies

### 1. Image Optimization

**Current Issues:**
- Large image file sizes
- No WebP/AVIF support
- Missing lazy loading
- No blur placeholders

**Solutions:**
```typescript
// Use OptimizedImage component
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/assets/product.jpg"
  alt="Product name"
  width={800}
  height={600}
  priority={isAboveFold}
/>
```

**Implementation Checklist:**
- ✅ All images use `next/image`
- ✅ WebP/AVIF formats with fallbacks
- ✅ Proper `sizes` attribute for responsive images
- ✅ Blur placeholder for LCP images
- ✅ Lazy loading for below-fold images
- ✅ Priority flag for hero images

**Expected Impact:**
- 40-60% reduction in image file sizes
- 0.5-1s improvement in LCP
- Better mobile performance

### 2. Code Splitting & Bundle Optimization

**Current Issues:**
- Large main bundle (>200KB)
- Three.js loaded on all pages
- Heavy component libraries loaded upfront

**Solutions:**
```typescript
// Use dynamic imports
import dynamic from 'next/dynamic';

const DynamicKonfiguratorius3D = dynamic(
  () => import('@/components/Konfiguratorius3D'),
  { 
    loading: () => <div>Loading 3D viewer...</div>,
    ssr: false 
  }
);
```

**Implementation Checklist:**
- ✅ Dynamic imports for 3D configurator
- ✅ Dynamic imports for admin components
- ✅ Tree-shaking enabled
- ✅ Unused dependencies removed
- ✅ Route-based code splitting
- ✅ Bundle analysis completed

**Expected Impact:**
- 30-50% reduction in initial bundle size
- 0.3-0.5s improvement in TTI
- Faster route transitions

### 3. Font Optimization

**Current Issues:**
- Multiple font weights loaded
- No font-display: swap
- Missing font preloading

**Solutions:**
```typescript
// Optimized font loading
const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-dm-sans',
  preload: true,
  fallback: ['system-ui', 'arial'],
});
```

**Implementation Checklist:**
- ✅ Font-display: swap enabled
- ✅ Only necessary weights loaded
- ✅ Font preloading for critical text
- ✅ Subset fonts (latin, latin-ext only)
- ✅ Fallback fonts defined

**Expected Impact:**
- Eliminate font-related layout shifts
- 0.2-0.4s improvement in FCP
- Better CLS score

### 4. Database Query Optimization

**Current Issues:**
- Missing database indexes
- No query result caching
- N+1 query problems

**Solutions:**
```typescript
// Implement caching
import { unstable_cache } from 'next/cache';

export const getCachedProducts = unstable_cache(
  async () => await fetchProducts(),
  ['products-list'],
  { revalidate: 3600, tags: ['products'] }
);
```

**Implementation Checklist:**
- ✅ Indexes on foreign keys
- ✅ Query result caching (1 hour)
- ✅ Connection pooling configured
- ✅ Slow query logging enabled
- ✅ Batch queries where possible

**Expected Impact:**
- 50-80% reduction in database query time
- 0.3-0.5s improvement in TTFB
- Better scalability

### 5. Caching Strategy

**Current Issues:**
- No cache headers on static assets
- API responses not cached
- ISR not utilized

**Solutions:**
```typescript
// next.config.ts
headers: async () => [
  {
    source: '/assets/:path*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
],
```

**Implementation Checklist:**
- ✅ Static assets cached (1 year)
- ✅ API responses cached appropriately
- ✅ ISR enabled for product pages
- ✅ CDN integration (if applicable)
- ✅ Service worker for offline support

**Expected Impact:**
- 80-95% reduction in repeat visit load times
- Better perceived performance
- Reduced bandwidth costs

### 6. Performance Monitoring

**Implementation:**
```typescript
// app/layout.tsx
export { reportWebVitals } from '@/lib/monitoring/performance';
```

**Monitoring Checklist:**
- ✅ Web Vitals tracking
- ✅ Google Analytics integration
- ✅ Error monitoring (Sentry)
- ✅ Performance budgets set
- ✅ Automated alerts configured

## Running Performance Audits

### Local Development
```bash
# Start dev server
npm run dev

# Run Lighthouse audit (in new terminal)
npm run audit:performance

# Analyze bundle
npm run analyze
```

### CI/CD Integration
```yaml
# .github/workflows/performance.yml
- name: Run Lighthouse CI
  run: |
    npm run build
    npm run start &
    npm run audit:performance
```

## Performance Budget

### Bundle Size Budget
- Main bundle: < 200KB
- Page bundles: < 100KB each
- Total JavaScript: < 500KB
- Total CSS: < 50KB

### Time Budget
- LCP: < 2.5s
- FCP: < 1.8s
- TTI: < 3.8s
- TTFB: < 600ms

### Resource Budget
- Images per page: < 2MB
- Fonts: < 100KB
- Third-party scripts: < 150KB

## Tools & Resources

### Analysis Tools
- **Lighthouse CI**: Automated performance testing
- **Bundle Analyzer**: Visualize bundle composition
- **Chrome DevTools**: Performance profiling
- **WebPageTest**: Real-world performance testing

### Monitoring Tools
- **Google Analytics**: Web Vitals tracking
- **Sentry**: Error and performance monitoring
- **Vercel Analytics**: Real user monitoring

### Commands
```bash
# Performance audit
npm run audit:performance

# Bundle analysis
npm run analyze

# Build size check
npm run build && du -sh .next

# Check unused dependencies
npx depcheck
```

## Optimization Workflow

1. **Baseline Audit**
   - Run Lighthouse on key pages
   - Document current metrics
   - Identify bottlenecks

2. **Implement Optimizations**
   - Start with highest impact items
   - Test each optimization
   - Measure improvements

3. **Validate**
   - Re-run Lighthouse
   - Compare before/after
   - Check for regressions

4. **Monitor**
   - Set up continuous monitoring
   - Track metrics over time
   - Alert on regressions

## Common Issues & Solutions

### Issue: Large LCP time
**Solutions:**
- Optimize hero image
- Add priority flag to LCP image
- Preload critical resources
- Reduce server response time

### Issue: Poor CLS score
**Solutions:**
- Define image dimensions
- Reserve space for dynamic content
- Use font-display: swap
- Avoid inserting content above existing content

### Issue: High TTI
**Solutions:**
- Reduce JavaScript bundle size
- Defer non-critical scripts
- Use code splitting
- Minimize main thread work

### Issue: Slow TTFB
**Solutions:**
- Optimize database queries
- Implement caching
- Use CDN
- Reduce server processing time

## Next Steps

1. Run baseline performance audit
2. Implement image optimizations
3. Set up dynamic imports
4. Configure caching headers
5. Add performance monitoring
6. Set up automated testing
7. Document improvements

## References

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
