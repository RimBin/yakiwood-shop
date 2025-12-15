# Performance Optimization Checklist

Complete checklist for performance optimization implementation and monitoring.

## 📸 Images

### Implementation
- [ ] All images use `next/image` component
- [ ] Images have explicit `width` and `height` props
- [ ] WebP/AVIF formats enabled in `next.config.ts`
- [ ] Proper `sizes` attribute for responsive images
- [ ] Blur placeholder for above-fold images
- [ ] `priority` flag set for LCP image (hero image)
- [ ] Lazy loading enabled for below-fold images
- [ ] Image quality optimized (75-85 depending on use case)
- [ ] Product images in `public/` or served from CDN
- [ ] Figma asset URLs replaced with permanent URLs

### Validation
- [ ] No layout shift when images load (CLS < 0.1)
- [ ] LCP image loads in < 2.5s
- [ ] Image file sizes < 200KB each
- [ ] No unstyled image flash during load
- [ ] Images load on slow 3G connections

## 📦 Code Splitting & Bundle

### Implementation
- [ ] Dynamic imports for 3D configurator (`Konfiguratorius3D`)
- [ ] Dynamic imports for admin components
- [ ] Dynamic imports for cart drawer
- [ ] Route-based code splitting enabled (default in App Router)
- [ ] Tree-shaking enabled in production builds
- [ ] Unused dependencies removed from `package.json`
- [ ] `lodash` replaced with `lodash-es` or removed
- [ ] Large libraries (moment, etc.) replaced with lighter alternatives

### Validation
- [ ] Main bundle < 200KB (gzipped)
- [ ] Page bundles < 100KB each (gzipped)
- [ ] Total JavaScript < 500KB (gzipped)
- [ ] No duplicate code in multiple bundles
- [ ] Bundle analysis report generated
- [ ] First Load JS shown in build output

## 🔤 Fonts

### Implementation
- [ ] Font-display: swap enabled
- [ ] Only necessary font weights loaded (300, 400, 500)
- [ ] Font subsets specified (`latin`, `latin-ext`)
- [ ] CSS variables for fonts defined
- [ ] Font preloading configured for critical fonts
- [ ] Fallback fonts defined (system-ui, arial)
- [ ] No external font CDN (fonts bundled with Next.js)

### Validation
- [ ] No FOIT (Flash of Invisible Text)
- [ ] No FOUT (Flash of Unstyled Text)
- [ ] Font-related CLS < 0.05
- [ ] Fonts load on first paint

## 🗄️ Database

### Implementation
- [ ] Indexes on `products(slug)`
- [ ] Indexes on `products(category)`
- [ ] Indexes on `variants(product_id)`
- [ ] Indexes on `orders(user_id)`
- [ ] Indexes on foreign keys
- [ ] Query result caching (1 hour for products)
- [ ] Connection pooling configured
- [ ] Slow query logging enabled
- [ ] N+1 queries eliminated

### Validation
- [ ] Product list query < 100ms
- [ ] Product detail query < 50ms
- [ ] No queries > 500ms in production
- [ ] Database CPU usage < 50%
- [ ] Connection pool not exhausted

## 💾 Caching

### Implementation
- [ ] Static assets cached (1 year) - `Cache-Control: public, max-age=31536000, immutable`
- [ ] Product images cached (1 week)
- [ ] API responses cached appropriately
- [ ] ISR enabled for product pages (revalidate: 3600)
- [ ] ISR enabled for product list (revalidate: 1800)
- [ ] CDN configured (if using external CDN)
- [ ] Service worker for offline support (optional)

### Validation
- [ ] Cache hit rate > 80% for static assets
- [ ] Repeat visit load time < 1s
- [ ] CDN cache hit rate > 90%
- [ ] No unnecessary revalidations

## 📊 Monitoring & Analytics

### Implementation
- [ ] Web Vitals tracking enabled (`reportWebVitals`)
- [ ] Google Analytics integration
- [ ] Custom metrics tracked (render times, API calls)
- [ ] Error monitoring (Sentry or similar)
- [ ] Performance budgets defined
- [ ] Automated alerts for regressions
- [ ] Real user monitoring (RUM) enabled

### Validation
- [ ] Web Vitals data visible in GA4
- [ ] Performance dashboards created
- [ ] Alert notifications working
- [ ] Error rate < 1%

## 🎯 Core Web Vitals Targets

### LCP (Largest Contentful Paint)
- [ ] Desktop: < 2.0s
- [ ] Mobile: < 2.5s
- [ ] Identified LCP element (hero image/text)
- [ ] LCP element prioritized
- [ ] No render-blocking resources before LCP

### FID (First Input Delay) / INP (Interaction to Next Paint)
- [ ] Desktop: < 50ms
- [ ] Mobile: < 100ms
- [ ] No long tasks > 50ms on main thread
- [ ] JavaScript execution optimized
- [ ] Third-party scripts deferred

### CLS (Cumulative Layout Shift)
- [ ] Desktop: < 0.05
- [ ] Mobile: < 0.1
- [ ] Image dimensions defined
- [ ] Font-display: swap
- [ ] No dynamic content insertion above fold
- [ ] Skeleton loaders for dynamic content

### FCP (First Contentful Paint)
- [ ] Desktop: < 1.5s
- [ ] Mobile: < 1.8s
- [ ] Critical CSS inlined
- [ ] Fonts optimized

### TTFB (Time to First Byte)
- [ ] < 600ms on good connections
- [ ] Server response time optimized
- [ ] Database queries optimized
- [ ] Caching headers configured

## 🚀 Deployment & Build

### Implementation
- [ ] Production build (`npm run build`) succeeds
- [ ] No build warnings or errors
- [ ] Build output size reasonable
- [ ] Source maps generated for debugging
- [ ] Environment variables configured
- [ ] CI/CD pipeline includes performance checks

### Validation
- [ ] Build time < 5 minutes
- [ ] No failed optimizations in build output
- [ ] Lighthouse CI passing in pipeline
- [ ] Bundle size within budget

## 📱 Mobile Performance

### Implementation
- [ ] Mobile-first responsive design
- [ ] Touch targets > 44x44px
- [ ] No horizontal scroll on mobile
- [ ] Viewport meta tag configured
- [ ] Mobile menu optimized
- [ ] Touch gestures work smoothly

### Validation
- [ ] Lighthouse Mobile score > 85
- [ ] Works on iOS Safari
- [ ] Works on Android Chrome
- [ ] Loads on 3G connection < 5s

## 🔍 Testing & Validation

### Tools Used
- [ ] Lighthouse (Chrome DevTools)
- [ ] PageSpeed Insights
- [ ] WebPageTest
- [ ] Chrome DevTools Performance
- [ ] Bundle Analyzer
- [ ] Coverage report

### Automated Tests
- [ ] Lighthouse CI in GitHub Actions
- [ ] Bundle size check in CI
- [ ] Performance regression tests
- [ ] Visual regression tests

## 📈 Performance Scores

### Current Scores (Baseline)
Date: ________________

| Page | Lighthouse Desktop | Lighthouse Mobile | LCP | CLS | Notes |
|------|-------------------|-------------------|-----|-----|-------|
| Homepage | ___ | ___ | ___ | ___ | |
| Products | ___ | ___ | ___ | ___ | |
| Product Detail | ___ | ___ | ___ | ___ | |
| Checkout | ___ | ___ | ___ | ___ | |

### Target Scores

| Page | Lighthouse Desktop | Lighthouse Mobile | LCP | CLS |
|------|-------------------|-------------------|-----|-----|
| Homepage | 90+ | 85+ | < 2.0s | < 0.05 |
| Products | 90+ | 85+ | < 2.5s | < 0.1 |
| Product Detail | 85+ | 80+ | < 2.5s | < 0.1 |
| Checkout | 85+ | 80+ | < 2.5s | < 0.1 |

### Post-Optimization Scores
Date: ________________

| Page | Lighthouse Desktop | Lighthouse Mobile | LCP | CLS | Improvement |
|------|-------------------|-------------------|-----|-----|-------------|
| Homepage | ___ | ___ | ___ | ___ | ___ |
| Products | ___ | ___ | ___ | ___ | ___ |
| Product Detail | ___ | ___ | ___ | ___ | ___ |
| Checkout | ___ | ___ | ___ | ___ | ___ |

## 🎓 Resources & Documentation

- [ ] [PERFORMANCE.md](./PERFORMANCE.md) - Main performance guide
- [ ] [DATABASE_OPTIMIZATION.md](./DATABASE_OPTIMIZATION.md) - Database optimization
- [ ] Performance audit scripts in `scripts/`
- [ ] Bundle analyzer configured
- [ ] Team trained on performance best practices

## 🔄 Continuous Monitoring

### Daily
- [ ] Check error rates
- [ ] Monitor Web Vitals in GA4
- [ ] Review slow API endpoints

### Weekly
- [ ] Run Lighthouse audits
- [ ] Review performance trends
- [ ] Check bundle size changes

### Monthly
- [ ] Full performance audit
- [ ] Database index analysis
- [ ] Third-party script review
- [ ] Performance budget review

## ✅ Sign-off

**Optimizations Completed By:** ________________  
**Date:** ________________  
**Reviewed By:** ________________  
**Date:** ________________  

**Notes:**
