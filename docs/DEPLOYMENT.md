# Deployment Guide - yakiwood-website

Complete guide for deploying the yakiwood-website Next.js e-commerce platform to production.

---

## Overview

This guide covers deploying the yakiwood-website to production using:
- **Hosting:** Vercel (recommended for Next.js)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** Resend/SendGrid/etc.
- **Monitoring:** Sentry, Google Analytics

**Estimated deployment time:** 30-45 minutes

---

## Prerequisites

Before starting deployment, ensure you have:

1. **Accounts created:**
   - [Vercel](https://vercel.com) account
   - [Supabase](https://supabase.com) project
   - [Stripe](https://stripe.com) account (verified)
   - Email service account (Resend/SendGrid)
   - [Sentry](https://sentry.io) account (optional but recommended)
   - Google Analytics property created

2. **Access requirements:**
   - Admin access to GitHub repository
   - Domain name registered (optional, can use Vercel subdomain)
   - Access to DNS management (if using custom domain)

3. **Local setup:**
   - All environment variables working locally
   - Production build tested (`npm run build`)
   - All tests passing (`npm run test`, `npx playwright test`)

4. **Completed:**
   - Pre-launch checklist reviewed (`docs/PRE_LAUNCH_CHECKLIST.md`)
   - Code merged to `main` branch
   - All pending PRs reviewed and merged

---

## Environment Variables

### Required Production Environment Variables

Create these in Vercel dashboard (Settings → Environment Variables):

#### Next.js & App
```bash
# Base URL (your production domain)
NEXT_PUBLIC_APP_URL=https://yakiwood.lt

# Node Environment
NODE_ENV=production
```

#### Supabase
```bash
# Supabase Project URL (from Supabase dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# Supabase Anon Key (public, safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Stripe
```bash
# Stripe Production Keys (from Stripe dashboard → Developers → API keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Stripe Webhook Secret (created after webhook setup)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

#### Email Service
```bash
# Resend (recommended)
RESEND_API_KEY=re_xxxxx

# OR SendGrid
SENDGRID_API_KEY=SG.xxxxx
```

#### Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```

#### Feature Flags (optional)
```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_3D_CONFIGURATOR=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
```

### Environment Variable Security

**Important:**
- ✅ **NEXT_PUBLIC_*** variables are exposed to the browser (use for non-sensitive data only)
- ⚠️ Server-only keys (STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY) must NEVER be prefixed with NEXT_PUBLIC_
- 🔒 Never commit `.env` files to Git (already in `.gitignore`)
- 📋 Store production secrets in secure password manager
- 🔄 Rotate keys regularly (quarterly recommended)

---

## Database Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Configure:
   - **Name:** yakiwood-production
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Frankfurt (closest to Lithuania)
   - **Pricing Plan:** Pro (recommended for production)

### 2. Run Database Migrations

Execute the seed SQL to create tables and initial data:

```bash
# Copy contents of supabase/seed.sql
# Go to Supabase Dashboard → SQL Editor
# Paste and execute the entire SQL file
```

The migration includes:
- `products` table
- `product_variants` table
- `product_configurations` table
- `orders` table
- `order_items` table
- `cart_items` table
- `newsletter_subscriptions` table
- Row Level Security (RLS) policies
- Indexes for performance

### 3. Verify Tables Created

In Supabase Dashboard → Table Editor, confirm these tables exist:
- ✅ products
- ✅ product_variants
- ✅ product_configurations
- ✅ orders
- ✅ order_items
- ✅ cart_items
- ✅ newsletter_subscriptions

### 4. Enable Row Level Security

In Supabase Dashboard → Authentication → Policies:

1. Verify RLS is enabled for all tables
2. Test policies by trying to query data
3. Confirm anonymous users can read products but not write

### 5. Configure Database Backups

In Supabase Dashboard → Database → Backups:
- ✅ Enable automatic daily backups (included in Pro plan)
- ✅ Set backup retention to 7 days minimum
- ✅ Test backup restoration in staging environment

---

## Vercel Deployment

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Select **Import Git Repository**
4. Find and select `yakiwood-website` repository
5. Click **Import**

### Step 2: Configure Build Settings

Configure the following settings:

**Framework Preset:** Next.js  
**Root Directory:** `./` (root)  
**Build Command:** `npm run build`  
**Output Directory:** `.next` (automatic)  
**Install Command:** `npm ci --legacy-peer-deps`

**Environment Variables:**  
Add all production environment variables from the section above. You can:
- Add them manually one by one
- Or use the `.env.production` template and copy-paste (NOT recommended for secrets)

**Node.js Version:** 18.x or later

### Step 3: Deploy

1. Click **Deploy**
2. Wait for build to complete (3-5 minutes)
3. Vercel will provide a deployment URL: `https://yakiwood-website-xxxxx.vercel.app`

### Step 4: Verify Deployment

Once deployed, verify:
- ✅ Homepage loads: `https://your-deployment.vercel.app`
- ✅ No build errors in Vercel logs
- ✅ All routes accessible (`/produktai`, `/sprendimai`, etc.)
- ✅ Check Vercel Logs for any runtime errors

---

## Domain & SSL Setup

### Option A: Use Vercel Subdomain (easiest)

Your site is immediately available at:
```
https://yakiwood-website.vercel.app
```

No additional configuration needed. HTTPS is automatic.

### Option B: Custom Domain (recommended)

#### 1. Add Domain in Vercel

1. Go to Vercel Dashboard → Project Settings → Domains
2. Click **Add Domain**
3. Enter your domain: `yakiwood.lt`
4. Vercel will provide DNS records

#### 2. Configure DNS

In your domain registrar (e.g., Namecheap, GoDaddy):

**For root domain (yakiwood.lt):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**DNS propagation:** Can take 24-48 hours

#### 3. Verify Domain

1. Wait for DNS propagation (check with `nslookup yakiwood.lt`)
2. In Vercel, click **Verify** next to your domain
3. Once verified, SSL certificate is automatically provisioned
4. Your site is now live at `https://yakiwood.lt`

### Redirect www to non-www (or vice versa)

Vercel automatically handles redirects. Choose in Project Settings → Domains:
- ✅ Redirect `www.yakiwood.lt` → `yakiwood.lt` (recommended)

---

## Post-Deployment Verification

### Smoke Tests Checklist

Run these tests immediately after deployment:

#### 1. Core Functionality
```bash
# Test homepage
curl -I https://yakiwood.lt
# Expected: HTTP 200

# Test API health endpoint (if exists)
curl https://yakiwood.lt/api/health
# Expected: {"status": "ok"}
```

- [ ] Homepage loads without errors
- [ ] Products page displays products from database
- [ ] Product detail pages load
- [ ] 3D configurator renders
- [ ] Navigation works (all menu items)

#### 2. Authentication Flow
- [ ] User registration works
- [ ] Login works
- [ ] Password reset email sends
- [ ] Admin panel accessible (with admin credentials)

#### 3. E-commerce Flow
- [ ] Add product to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Proceed to checkout
- [ ] Complete test purchase with Stripe test card
  - Card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
- [ ] Order confirmation page displays
- [ ] Order confirmation email received

#### 4. Newsletter & Contact
- [ ] Newsletter signup works
- [ ] Contact form submits successfully
- [ ] Contact form email received

#### 5. Database Connectivity
- [ ] Products load from Supabase
- [ ] User registration writes to database
- [ ] Orders save correctly
- [ ] No database connection errors in logs

#### 6. Performance & Monitoring
- [ ] Run Lighthouse audit (target: 90+ on all scores)
- [ ] Check Vercel Analytics for traffic
- [ ] Verify Google Analytics tracking (check Real-Time report)
- [ ] Confirm Sentry is receiving events (create test error)

### Check Logs

Monitor for errors:

1. **Vercel Logs:** Dashboard → Logs → Real-time
2. **Supabase Logs:** Dashboard → Logs → Database
3. **Stripe Dashboard:** Developers → Events
4. **Sentry Dashboard:** Issues (if configured)

---

## Monitoring Setup

### 1. Google Analytics

Already configured if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

**Verify tracking:**
1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to **Real-time** → **Overview**
4. Visit your site
5. Confirm you appear in real-time view

### 2. Sentry Error Tracking

**Setup:**
1. Create project at [Sentry.io](https://sentry.io)
2. Select **Next.js** as platform
3. Copy DSN to `NEXT_PUBLIC_SENTRY_DSN` in Vercel
4. Deploy changes

**Test error tracking:**
```typescript
// Temporarily add to a page to test
throw new Error('Sentry test error');
```

Visit the page and confirm error appears in Sentry dashboard.

### 3. Uptime Monitoring

**Recommended services:**
- [UptimeRobot](https://uptimerobot.com) (free tier available)
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

**Setup:**
1. Create account
2. Add HTTP(S) monitor
3. URL: `https://yakiwood.lt`
4. Check interval: 5 minutes
5. Configure alerts (email/SMS)

### 4. Vercel Analytics

Automatically enabled. View in Vercel Dashboard → Analytics.

Provides:
- Page views
- Top pages
- Real User Monitoring (RUM)
- Web Vitals

---

## Stripe Webhook Configuration

### 1. Create Webhook in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://yakiwood.lt/api/checkout/webhook`
   - **Listen to:** Events on your account
   - **Select events to listen to:**
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

4. Click **Add endpoint**

### 2. Get Webhook Secret

1. Click on the newly created webhook
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add to Vercel environment variables:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_xxxxx`

### 3. Test Webhook

1. In Stripe Dashboard → Webhooks, click your webhook
2. Click **Send test webhook**
3. Select `checkout.session.completed`
4. Click **Send test webhook**
5. Check Vercel logs for webhook processing

### 4. Verify Webhook Implementation

The webhook handler should be at `app/api/checkout/webhook/route.ts`. Ensure it:
- ✅ Verifies webhook signature
- ✅ Handles `checkout.session.completed` event
- ✅ Creates order in database
- ✅ Sends order confirmation email
- ✅ Returns 200 status on success

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Build fails with "Module not found"
**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install --legacy-peer-deps
# Commit package-lock.json
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### Issue: Environment variables not working
**Solution:**
- Check spelling (exact match required)
- Verify environment is set to "Production"
- Redeploy after adding variables (required)
- For `NEXT_PUBLIC_*` vars, they're baked into build

#### Issue: Database connection errors
**Solution:**
- Verify Supabase project is not paused (free tier pauses after inactivity)
- Check Supabase credentials are correct
- Confirm RLS policies allow the operation
- Check Supabase Dashboard → Settings → Database for connection string

#### Issue: Stripe webhook not receiving events
**Solution:**
- Verify webhook URL is correct (no trailing slash)
- Check webhook is listening to correct events
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Check Vercel logs for webhook errors
- Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/checkout/webhook`

#### Issue: Images not loading
**Solution:**
- Verify Figma URLs are updated (they expire every 7 days)
- Move images to `public/` folder for production
- Check `next.config.ts` has correct image domains
- Verify images are optimized (not too large)

#### Issue: 500 Internal Server Error
**Solution:**
- Check Vercel logs: Dashboard → Logs → Real-time
- Check Sentry for error details (if configured)
- Verify all environment variables are set
- Check database connectivity

#### Issue: Slow page loads
**Solution:**
- Run Lighthouse audit to identify bottlenecks
- Check bundle size: `npm run build` (analyze output)
- Optimize images (use WebP format)
- Enable caching headers in `next.config.ts`
- Consider using ISR (Incremental Static Regeneration)

#### Issue: CORS errors
**Solution:**
- Verify API routes return proper CORS headers
- Check Supabase CORS configuration
- Ensure requests are from allowed origins

#### Issue: Locale/translation errors
**Solution:**
- Verify `messages/lt.json` has all required keys
- Check `next-intl.config.ts` configuration
- Ensure locale is set to `'lt'` in `i18n/request.ts`
- Clear `.next` cache: `rm -rf .next`

---

## Rollback Procedure

If critical issues are discovered post-deployment, follow this rollback procedure:

### Option 1: Instant Rollback (Vercel)

**Fastest method (2 minutes):**

1. Go to Vercel Dashboard → Deployments
2. Find the previous stable deployment
3. Click **⋮** (three dots) → **Promote to Production**
4. Confirm rollback
5. Previous version is now live

### Option 2: Redeploy Previous Commit (GitHub)

**If Option 1 unavailable (5 minutes):**

1. Identify last stable commit:
   ```bash
   git log --oneline
   ```

2. Revert to previous commit:
   ```bash
   # Create revert commit
   git revert HEAD --no-edit
   git push origin main
   ```

3. Vercel automatically redeploys the reverted version

### Option 3: Manual Fix & Deploy

**If issue is fixable quickly (10 minutes):**

1. Fix the issue locally
2. Test thoroughly: `npm run build && npm start`
3. Commit and push:
   ```bash
   git add .
   git commit -m "fix: critical production issue"
   git push origin main
   ```
4. Monitor Vercel deployment

### Post-Rollback

After rolling back:

1. ✅ Verify site is stable
2. ✅ Communicate status to stakeholders
3. ✅ Investigate root cause
4. ✅ Create post-mortem document
5. ✅ Implement fix and test in staging
6. ✅ Redeploy with fix when ready

---

## Production Support Contacts

Keep this information accessible for emergencies:

**Services:**
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Supabase Support: [supabase.com/support](https://supabase.com/support)
- Stripe Support: [support.stripe.com](https://support.stripe.com)

**Escalation:**
- Technical Lead: [email]
- Product Owner: [email]
- DevOps/Infrastructure: [email]

**Emergency Contacts:**
- On-call Developer: [phone]
- System Administrator: [phone]

---

## Next Steps After Deployment

1. **Monitor for 48 hours:**
   - Check logs hourly for first 6 hours
   - Monitor error rates in Sentry
   - Watch Vercel Analytics for traffic patterns

2. **Set up recurring tasks:**
   - Weekly dependency updates (`npm outdated`)
   - Monthly security audits (`npm audit`)
   - Quarterly performance reviews (Lighthouse)
   - Database backup verification (monthly)

3. **Documentation:**
   - Update README.md with production URL
   - Document any deployment-specific configurations
   - Create runbook for common operations

4. **Team enablement:**
   - Share Vercel/Supabase/Stripe access with team
   - Review deployment process with team
   - Document any post-deployment changes

---

## Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-production)
- [Stripe Production Checklist](https://stripe.com/docs/development/checklist)

---

**Deployment Version:** 1.0  
**Last Updated:** December 15, 2025  
**Maintained By:** Development Team

For questions or issues with this guide, please create an issue in the repository or contact the technical lead.
