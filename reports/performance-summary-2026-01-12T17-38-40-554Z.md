# Performance Audit Report

**Generated:** 2026-01-12T17:38:40.565Z

## Summary

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS |
|------|-------------|---------------|----------------|-----|-----|-----|
| Homepage | 23 | 94 | 100 | 83 | 27522ms | 0.257 |
| Products Page | 29 | 91 | 100 | 83 | 33192ms | 0.143 |
| Product Detail | 31 | 94 | 100 | 58 | 28273ms | 0.113 |
| Solutions | Error | - | - | - | - | - |
| Projects | Error | - | - | - | - | - |

## Core Web Vitals Targets

- **LCP** (Largest Contentful Paint): < 2.5s ⚡
- **FID** (First Input Delay): < 100ms 🎯
- **CLS** (Cumulative Layout Shift): < 0.1 📐

## Detailed Metrics

### Homepage

- **Performance Score:** 23/100
- **First Contentful Paint:** 1462ms
- **Largest Contentful Paint:** 27522ms ⚠️
- **Cumulative Layout Shift:** 0.257 ⚠️
- **Time to Interactive:** 30830ms
- **Total Blocking Time:** 11782ms
- **Speed Index:** 9789ms

### Products Page

- **Performance Score:** 29/100
- **First Contentful Paint:** 1661ms
- **Largest Contentful Paint:** 33192ms ⚠️
- **Cumulative Layout Shift:** 0.143 ⚠️
- **Time to Interactive:** 33750ms
- **Total Blocking Time:** 13311ms
- **Speed Index:** 30807ms

### Product Detail

- **Performance Score:** 31/100
- **First Contentful Paint:** 1432ms
- **Largest Contentful Paint:** 28273ms ⚠️
- **Cumulative Layout Shift:** 0.113 ⚠️
- **Time to Interactive:** 28633ms
- **Total Blocking Time:** 12815ms
- **Speed Index:** 39111ms

### Solutions

**Error:** Cannot read properties of undefined (reading 'toFixed')

### Projects

**Error:** Cannot read properties of undefined (reading 'toFixed')

## Recommendations

1. **Images**: Optimize all images with WebP/AVIF formats
2. **Code Splitting**: Implement dynamic imports for heavy components
3. **Fonts**: Ensure font-display: swap is set
4. **Caching**: Implement aggressive caching for static assets
5. **Database**: Add indexes and query result caching
6. **Bundle Size**: Analyze and reduce JavaScript bundle size

