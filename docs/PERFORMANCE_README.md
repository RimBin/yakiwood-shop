# Performance Optimization System

Complete performance optimization suite for the Yakiwood e-commerce platform.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Tools & Scripts](#tools--scripts)
- [Components](#components)
- [Monitoring](#monitoring)
- [Best Practices](#best-practices)

## Overview

This performance optimization system provides:

✅ **Image Optimization** - WebP/AVIF, lazy loading, blur placeholders  
✅ **Code Splitting** - Dynamic imports for heavy components  
✅ **Font Optimization** - Display swap, preloading, fallbacks  
✅ **Database Optimization** - Query caching, indexes, monitoring  
✅ **Caching Strategy** - Static assets, ISR, API responses  
✅ **Bundle Analysis** - Size monitoring, optimization suggestions  
✅ **Performance Monitoring** - Web Vitals tracking, analytics  
✅ **Loading States** - Skeleton components for better UX

## Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Run Performance Audit

```bash
# Start dev server
npm run dev

# In another terminal, run audit
npm run audit:performance
```

### 3. Analyze Bundle

```bash
# Build with analysis
npm run analyze

# Or check bundle size
npm run analyze:bundle
```

### 4. Check Results

Reports are generated in the `reports/` directory:
- `performance-summary-[timestamp].json`
- `performance-summary-[timestamp].md`
- `bundle-analysis.json`

## Documentation

### Main Guides

- **[PERFORMANCE.md](./PERFORMANCE.md)** - Complete performance optimization guide
- **[DATABASE_OPTIMIZATION.md](./DATABASE_OPTIMIZATION.md)** - Database performance tuning
- **[PERFORMANCE_CHECKLIST.md](./PERFORMANCE_CHECKLIST.md)** - Implementation checklist
- **[PERFORMANCE_AUDIT_TEMPLATE.md](./PERFORMANCE_AUDIT_TEMPLATE.md)** - Audit report template

### Key Metrics Targets

| Metric | Target | Description |
|--------|--------|-------------|
| **Lighthouse Desktop** | 90+ | Overall performance score |
| **Lighthouse Mobile** | 85+ | Mobile performance score |
| **LCP** | < 2.5s | Largest Contentful Paint |
| **FID/INP** | < 100ms | First Input Delay / Interaction |
| **CLS** | < 0.1 | Cumulative Layout Shift |
| **FCP** | < 1.8s | First Contentful Paint |
| **TTFB** | < 600ms | Time to First Byte |

## Tools & Scripts

### Performance Audit

```bash
npm run audit:performance
```

Runs Lighthouse audits on key pages and generates comprehensive reports.

**Features:**
- Multi-page auditing
- Core Web Vitals tracking
- Markdown report generation
- JSON data export

### Bundle Analysis

```bash
# Analyze current build
npm run analyze:bundle

# Build with visual analyzer
npm run analyze
```

**What it shows:**
- Bundle sizes (gzipped/uncompressed)
- Largest chunks
- Optimization recommendations
- Dependency analysis

### Environment Check

```bash
npm run env:check
```

Validates environment variables and configuration.

## Components

### OptimizedImage

Wrapper around `next/image` with loading states and error handling.

```tsx
import OptimizedImage from '@/components/OptimizedImage';

<OptimizedImage
  src="/assets/product.jpg"
  alt="Product"
  width={800}
  height={600}
  priority={true} // For above-fold images
  imageType="product" // hero, product, thumbnail, icon
/>
```

**Features:**
- Automatic blur placeholder
- Loading skeleton
- Error handling
- Optimized quality settings
- Responsive sizes

### Dynamic Imports

Pre-configured dynamic imports for heavy components.

```tsx
import { 
  DynamicKonfiguratorius3D,
  DynamicFilterSidebar,
  DynamicCartDrawer 
} from '@/lib/dynamic-imports';

// Use like regular components
<DynamicKonfiguratorius3D />
```

**Available Components:**
- `DynamicKonfiguratorius3D` - 3D product configurator
- `DynamicFilterSidebar` - Product filtering UI
- `DynamicOrdersList` - Account orders list
- `DynamicProductManagement` - Admin product management
- `DynamicAnalyticsDashboard` - Analytics charts
- `DynamicNewsletterModal` - Newsletter signup modal
- `DynamicCartDrawer` - Shopping cart drawer
- `DynamicImageGallery` - Image lightbox
- `DynamicRichTextEditor` - Content editor
- `DynamicColorPicker` - Color selection tool

### Skeleton Components

Loading states for different page sections.

```tsx
import { 
  ProductGridSkeleton,
  ProductDetailSkeleton,
  OrdersListSkeleton 
} from '@/components/ui/Skeleton';

// Use in loading.tsx files
export default function Loading() {
  return <ProductGridSkeleton count={6} />;
}
```

**Available Skeletons:**
- `ProductCardSkeleton`
- `ProductGridSkeleton`
- `ProductDetailSkeleton`
- `OrdersListSkeleton`
- `ProjectCardSkeleton`
- `TableSkeleton`
- `FormSkeleton`
- `DashboardSkeleton`

## Monitoring

### Web Vitals Tracking

Automatically tracks Core Web Vitals and sends to analytics.

```tsx
// Already configured in app/layout.tsx
export { reportWebVitals } from '@/lib/monitoring/performance';
```

**Tracked Metrics:**
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)
- INP (Interaction to Next Paint)
- TTFB (Time to First Byte)

**Data Sent To:**
- Google Analytics (if configured)
- Custom endpoint: `/api/analytics/vitals`
- Console logs (development)

### Custom Metrics

Track custom performance metrics.

```tsx
import { trackCustomMetric, measureRender } from '@/lib/monitoring/performance';

// Track custom event
trackCustomMetric('checkout_flow', 2500);

// Measure component render time
const measure = measureRender('ProductList');
measure.start();
// ... component renders
measure.end();
```

### Database Query Monitoring

Track query performance and cache hit rates.

```tsx
import { timedQuery, getQueryMetrics } from '@/lib/db-optimizer';

// Wrap database queries
const products = await timedQuery(
  'fetch-products',
  () => fetchProducts()
);

// Get metrics
const metrics = getQueryMetrics();
console.log(metrics);
// {
//   total: 50,
//   cached: 35,
//   cacheHitRate: '70%',
//   avgDuration: '125ms',
//   slowQueries: 2
// }
```

## Best Practices

### Images

✅ **DO:**
- Use `<OptimizedImage>` component
- Set explicit width/height
- Use `priority` for above-fold images
- Implement lazy loading for below-fold
- Generate WebP/AVIF formats

❌ **DON'T:**
- Use raw `<img>` tags
- Load large images (>200KB)
- Skip width/height attributes
- Load all images eagerly

### Code Splitting

✅ **DO:**
- Dynamic import for 3D configurator
- Dynamic import for admin components
- Route-based splitting (automatic)
- Lazy load below-fold components

❌ **DON'T:**
- Import heavy libraries globally
- Load Three.js on all pages
- Inline large components

### Fonts

✅ **DO:**
- Set `display: "swap"`
- Preload critical fonts
- Define fallback fonts
- Load only needed weights

❌ **DON'T:**
- Load all font weights
- Skip font-display property
- Use external font CDNs

### Database

✅ **DO:**
- Add indexes on foreign keys
- Cache query results
- Use connection pooling
- Batch related queries

❌ **DON'T:**
- Use SELECT *
- Skip WHERE clauses
- Create N+1 queries
- Skip indexes

### Caching

✅ **DO:**
- Cache static assets (1 year)
- Use ISR for product pages
- Implement stale-while-revalidate
- Monitor cache hit rates

❌ **DON'T:**
- Skip cache headers
- Cache user-specific data
- Use short cache durations

## Configuration Files

### next.config.ts

Performance optimizations configured:

```typescript
// Image formats
formats: ['image/avif', 'image/webp']

// Package optimization
optimizePackageImports: ['lucide-react', '@react-three/fiber']

// Cache headers
headers: [...cacheHeaders]

// Bundle analysis
webpack: (config) => { /* analyzer */ }
```

### app/layout.tsx

Font optimization:

```typescript
// Font-display: swap
display: "swap"

// Preloading
preload: true

// Fallbacks
fallback: ["system-ui", "arial"]
```

### middleware.ts

Caching headers:

```typescript
// Static assets: 1 year
'/assets/*' → max-age=31536000, immutable

// API responses: stale-while-revalidate
'/api/products' → s-maxage=60, stale-while-revalidate=300
```

## Continuous Monitoring

### Weekly Tasks

- [ ] Run performance audit
- [ ] Check Web Vitals in Analytics
- [ ] Review slow query logs
- [ ] Monitor bundle size

### Monthly Tasks

- [ ] Full Lighthouse audit
- [ ] Database index analysis
- [ ] Third-party script review
- [ ] Performance budget review

### Automated Checks

Set up GitHub Actions for:

```yaml
# .github/workflows/performance.yml
- Lighthouse CI on every PR
- Bundle size checks
- Performance budgets
- Visual regression tests
```

## Troubleshooting

### High LCP (> 2.5s)

1. Check hero image optimization
2. Verify `priority` prop is set
3. Ensure no render-blocking resources
4. Optimize server response time

### High CLS (> 0.1)

1. Add width/height to all images
2. Verify font-display: swap
3. Check for dynamic content insertion
4. Use skeleton loaders

### Large Bundle Size

1. Run bundle analysis: `npm run analyze`
2. Check for duplicate dependencies
3. Implement dynamic imports
4. Remove unused dependencies

### Slow Database Queries

1. Check query logs
2. Add missing indexes
3. Implement caching
4. Optimize query structure

## Support & Resources

- **Documentation**: `docs/PERFORMANCE.md`
- **Checklist**: `docs/PERFORMANCE_CHECKLIST.md`
- **Audit Template**: `docs/PERFORMANCE_AUDIT_TEMPLATE.md`
- **GitHub Issues**: Report performance issues
- **Team Training**: Schedule performance workshop

## Contributing

When adding new features:

1. ✅ Use `OptimizedImage` for images
2. ✅ Add loading.tsx for new routes
3. ✅ Implement dynamic imports for heavy components
4. ✅ Add skeleton states
5. ✅ Test on slow 3G connection
6. ✅ Run performance audit
7. ✅ Check bundle size impact

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Maintainer:** Development Team
