# Pre-Launch Checklist

Complete checklist before deploying yakiwood-website to production. Check each item and verify functionality.

---

## Code Quality (10 items)

- [ ] All unit tests pass (`npm run test`)
- [ ] All E2E tests pass (`npx playwright test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors or warnings in production build
- [ ] All dependencies up to date (run `npm outdated`)
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Code reviewed and approved
- [ ] All TODO/FIXME comments addressed

---

## Functionality (20 items)

### Core Pages
- [ ] Homepage loads correctly (`/`)
- [ ] Products page displays all products (`/produktai`)
- [ ] Solutions page loads (`/sprendimai`)
- [ ] Projects page displays project gallery (`/projektai`)
- [ ] About page loads (`/apie`)
- [ ] Contact page loads and form works (`/kontaktai`)
- [ ] FAQ page displays accordion items (`/faq`)
- [ ] Newsletter page loads (`/naujienos`)

### Product Features
- [ ] Product detail pages load for all products (`/produktai/[slug]`)
- [ ] 3D configurator works (color/finish selection)
- [ ] Product images load correctly
- [ ] Product variants display properly

### Cart & Checkout
- [ ] Add to cart functionality works
- [ ] Cart updates quantity correctly
- [ ] Cart merges duplicate items (same product + color + finish)
- [ ] Remove from cart works
- [ ] Checkout flow completes successfully
- [ ] Stripe payment processes correctly
- [ ] Order confirmation displays after payment

### Authentication & Admin
- [ ] User registration works (`/register`)
- [ ] User login works (`/login`)
- [ ] Password reset flow works (`/forgot-password`, `/reset-password`)
- [ ] Admin panel accessible to admin users only (`/admin`)

---

## Content (10 items)

- [ ] All product descriptions complete and accurate
- [ ] All product images uploaded and optimized
- [ ] Lithuanian translations complete in `messages/lt.json`
- [ ] Privacy policy published (`/policies/privacy`)
- [ ] Terms of service published (`/policies/terms`)
- [ ] Cookie policy published (`/cookie-policy`)
- [ ] Refund/return policy published
- [ ] About page content finalized
- [ ] Contact information accurate (email, phone, address)
- [ ] Social media links updated (if applicable)

---

## SEO (10 items)

- [ ] Sitemap generated and accessible (`/sitemap.xml`)
- [ ] Robots.txt configured correctly (`/robots.txt`)
- [ ] Meta titles defined for all pages (max 60 characters)
- [ ] Meta descriptions defined for all pages (max 160 characters)
- [ ] Open Graph tags added to all pages
- [ ] Twitter Card tags added (if applicable)
- [ ] Structured data (JSON-LD) added for products
- [ ] Canonical URLs set correctly
- [ ] Google Analytics configured and tracking
- [ ] Google Search Console verified

---

## Performance (8 items)

- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] Core Web Vitals pass (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size analyzed and optimized
- [ ] Critical CSS inlined (handled by Next.js)

---

## Security (12 items)

- [ ] HTTPS enabled (handled by Vercel)
- [ ] Security headers configured (`next.config.ts`)
- [ ] Content Security Policy (CSP) configured
- [ ] CORS configured properly for API routes
- [ ] Rate limiting implemented for API routes
- [ ] SQL injection protection (Supabase RLS + parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF protection for forms
- [ ] Supabase Row Level Security (RLS) policies enabled
- [ ] API keys stored in environment variables (not committed)
- [ ] No sensitive data in client-side code
- [ ] Dependency vulnerabilities resolved (`npm audit fix`)

---

## Database (6 items)

- [ ] Supabase project created and configured
- [ ] Environment variables set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Database migrations run (`supabase/seed.sql` executed)
- [ ] RLS policies tested and verified
- [ ] Database indexes created for performance
- [ ] Backup strategy configured (Supabase automatic backups enabled)

---

## Payment Processing (8 items)

- [ ] Stripe account verified
- [ ] Stripe production API keys added to environment variables
- [ ] Stripe webhook configured (`/api/checkout/webhook`)
- [ ] Webhook secret stored in environment variables
- [ ] Test purchase completed successfully in production mode
- [ ] Payment confirmation emails send correctly
- [ ] Refund process tested
- [ ] Stripe dashboard notifications configured

---

## Email (7 items)

- [ ] Email service configured (Resend/SendGrid/etc.)
- [ ] Email API key added to environment variables
- [ ] Order confirmation email template tested
- [ ] Newsletter subscription confirmation tested
- [ ] Contact form submission email tested
- [ ] Password reset email tested
- [ ] Email sender domain verified (SPF/DKIM records)

---

## Integrations (4 items)

- [ ] Google Analytics tracking code installed
- [ ] Newsletter service integrated (Mailchimp/ConvertKit/etc.)
- [ ] Error tracking configured (Sentry recommended)
- [ ] Uptime monitoring configured (UptimeRobot/Pingdom/etc.)

---

## Mobile (5 items)

- [ ] Tested on iOS Safari (iPhone)
- [ ] Tested on Android Chrome
- [ ] Touch interactions work (configurator, buttons, forms)
- [ ] Forms submit correctly on mobile
- [ ] Checkout flow works on mobile

---

## Accessibility (5 items)

- [ ] Keyboard navigation works on all pages
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Color contrast meets WCAG AA standards
- [ ] Alt text provided for all images
- [ ] Form labels and ARIA attributes correct

---

## Legal & Compliance (7 items)

- [ ] Privacy policy reviewed by legal counsel
- [ ] Terms of service reviewed by legal counsel
- [ ] GDPR compliance verified (for EU customers)
- [ ] Cookie consent banner implemented (if required)
- [ ] Refund/return policy clearly stated
- [ ] Business registration information displayed
- [ ] Tax handling configured (if applicable)

---

## Monitoring & Alerts (5 items)

- [ ] Error tracking configured (Sentry/Bugsnag)
- [ ] Uptime monitoring alerts configured
- [ ] Performance monitoring enabled
- [ ] Payment failure notifications set up
- [ ] Database monitoring alerts configured

---

## Documentation (5 items)

- [ ] README.md updated with production details
- [ ] Environment variables documented
- [ ] API documentation complete
- [ ] Deployment guide reviewed (`docs/DEPLOYMENT.md`)
- [ ] Troubleshooting guide created

---

## Final Checks (5 items)

- [ ] Staging environment matches production configuration
- [ ] All team members have necessary access (Vercel, Supabase, Stripe)
- [ ] Backup and disaster recovery plan documented
- [ ] Rollback procedure tested
- [ ] Customer support plan in place (email, phone, hours)

---

## Sign-Off

**Completed by:** ___________________________  
**Date:** ___________________________  
**Approved by:** ___________________________  
**Launch Date:** ___________________________  

---

**Total Items:** 127 checklist items across 16 categories

**Note:** This checklist should be completed in a staging environment before production deployment. Any unchecked items should be documented with reasons and mitigation plans.
