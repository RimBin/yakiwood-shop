# Yakiwood E-commerce Setup Guide

This guide will help you complete the critical setup steps to get your Yakiwood e-commerce platform production-ready.

## 🚀 Quick Start Checklist

- [ ] Stripe Integration
- [ ] Email Configuration (Resend)
- [ ] Environment Variables
- [ ] Webhook Testing
- [ ] Production Deployment

---

## 1. Stripe Integration

### 1.1 Create Stripe Account

1. Go to https://stripe.com and create an account
2. Complete business verification (required for production)
3. Navigate to **Developers > API keys**

### 1.2 Get API Keys

Copy these keys to your `.env.local` file:

```env
# Test Mode (for development)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Production Mode (when ready to go live)
# STRIPE_SECRET_KEY=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 1.3 Setup Webhook

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **Local testing**: Use ngrok or Stripe CLI (see below)
   - **Production**: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 1.4 Test Webhook Locally

**Option A: Stripe CLI (Recommended)**

```bash
# Install Stripe CLI
# Windows (with Scoop): scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Or download from: https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Option B: ngrok**

```bash
# Install ngrok: https://ngrok.com/download

# Start your dev server
npm run dev

# In another terminal, start ngrok
ngrok http 3000

# Use the ngrok URL in Stripe webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/stripe
```

### 1.5 Test Payment Flow

1. Start dev server: `npm run dev`
2. Add products to cart
3. Go to checkout: `/checkout`
4. Fill in customer details
5. Click "Complete Order" → redirects to Stripe
6. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - ZIP: Any 5 digits
7. Complete payment
8. Should redirect to `/order-confirmation?session_id=...`
9. Check your email for invoice (if Resend is configured)

**Test Cards:**
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`
- More cards: https://stripe.com/docs/testing

---

## 2. Email Configuration (Resend)

### 2.1 Create Resend Account

1. Go to https://resend.com and sign up
2. Verify your email address
3. Navigate to **API Keys**

### 2.2 Get API Key

Add to `.env.local`:

```env
RESEND_API_KEY=re_...
```

### 2.3 Add Domain (Production Only)

For production emails to work properly:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain: `yakiwood.lt`
4. Follow DNS configuration instructions
5. Wait for verification (usually a few minutes)

### 2.4 Update Email Sender

Edit `app/api/webhooks/stripe/route.ts`:

```typescript
// Development (uses Resend's test domain)
from: 'Yakiwood <onboarding@resend.dev>'

// Production (after domain verification)
from: 'Yakiwood <info@yakiwood.lt>'
```

### 2.5 Test Email

Run webhook test (see Stripe section above) and check if email arrives.

---

## 3. Environment Variables

### 3.1 Create .env.local

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### 3.2 Required Variables

```env
# CRITICAL - Payment processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# CRITICAL - Order confirmation emails
RESEND_API_KEY=re_...

# CRITICAL - Site URL for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_SITE_URL=https://yakiwood.lt  # Production

# Sanity CMS (if not already configured)
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3.3 Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Newsletter (Mailchimp)
MAILCHIMP_API_KEY=...
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_AUDIENCE_ID=...

# Supabase (database features - currently disabled)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3.4 Validate Configuration

```bash
npm run env:check
npm run env:validate
```

---

## 4. Production Deployment

### 4.1 Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com and import repository
3. Add environment variables in **Settings > Environment Variables**:
   - Add ALL variables from `.env.local`
   - Use **production** Stripe keys (sk_live_..., pk_live_...)
   - Update `NEXT_PUBLIC_SITE_URL` to your domain
4. Deploy!

### 4.2 Stripe Production Checklist

Before going live with real payments:

- [ ] Activate Stripe account (complete business verification)
- [ ] Switch to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test payment flow on production
- [ ] Configure payout settings
- [ ] Set up tax collection (if applicable)
- [ ] Review Stripe's compliance requirements

### 4.3 Email Production Checklist

- [ ] Verify domain in Resend
- [ ] Update email sender to custom domain
- [ ] Test invoice email delivery
- [ ] Check spam folder placement
- [ ] Configure DMARC/SPF/DKIM records

---

## 5. Testing Checklist

### 5.1 Checkout Flow

- [ ] Add product to cart from product page
- [ ] Cart sidebar shows correct items/prices
- [ ] Click "Proceed to Checkout"
- [ ] Fill in customer details
- [ ] Click "Complete Order"
- [ ] Redirected to Stripe Checkout
- [ ] Complete payment with test card
- [ ] Redirected to order confirmation page
- [ ] Cart is cleared after successful payment

### 5.2 Webhook Processing

- [ ] Webhook receives checkout.session.completed event
- [ ] Order is created in database (check logs)
- [ ] Invoice is generated and saved
- [ ] PDF invoice is created
- [ ] Email is sent with invoice attachment
- [ ] Order status is updated to 'paid'

### 5.3 Error Handling

- [ ] Test with declined card (4000 0000 0000 0002)
- [ ] Test with expired webhook secret (should fail gracefully)
- [ ] Test with missing environment variables
- [ ] Test webhook timeout/retry behavior
- [ ] Test email delivery failure

---

## 6. Troubleshooting

### Webhook not receiving events

1. Check webhook URL is correct in Stripe dashboard
2. Verify webhook secret matches `.env.local`
3. Check server logs for errors: `npm run dev`
4. Test locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Email not sending

1. Verify Resend API key is correct
2. Check Resend dashboard for delivery logs
3. Verify sender email format: `Name <email@domain.com>`
4. For production, ensure domain is verified
5. Check spam folder

### Redirect not working

1. Verify `NEXT_PUBLIC_SITE_URL` is set correctly
2. Check for trailing slashes (should not have one)
3. Ensure URL includes protocol: `https://` or `http://`
4. Check browser console for errors

### Order not created

1. Check webhook is receiving events (Stripe dashboard)
2. Verify database connection (if using Supabase)
3. Check server logs for errors
4. Ensure customer metadata is being sent correctly

---

## 7. Monitoring & Maintenance

### 7.1 Stripe Dashboard

Monitor payments, refunds, disputes:
- https://dashboard.stripe.com

### 7.2 Resend Dashboard

Monitor email delivery, bounces:
- https://resend.com/emails

### 7.3 Application Logs

```bash
# Development
npm run dev  # Watch console output

# Production (Vercel)
# View logs in Vercel dashboard > Project > Logs
```

### 7.4 Performance Monitoring

```bash
npm run audit:performance
```

---

## 8. Next Steps

After completing this setup:

1. **Test thoroughly** with test cards and webhook events
2. **Review security** settings (CSP headers, rate limiting)
3. **Enable Supabase** for database features (optional)
4. **Add product images** to replace placeholders
5. **Replace 3D cube** with actual GLTF models
6. **Configure shipping** rules (if needed beyond current logic)
7. **Add tax calculation** for different regions
8. **Set up monitoring** (Sentry, LogRocket, etc.)

---

## 📞 Support

- **Stripe**: https://support.stripe.com
- **Resend**: https://resend.com/docs
- **Next.js**: https://nextjs.org/docs
- **Vercel**: https://vercel.com/support

---

**Last Updated**: December 2024
