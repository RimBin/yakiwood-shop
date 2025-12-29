# Stripe Checkout Flow - Implementation Documentation

## Overview

The Yakiwood e-commerce platform now has a fully functional Stripe checkout flow that handles:
- Cart management with localStorage persistence
- Customer details collection
- Stripe Checkout Session creation
- Payment processing via Stripe
- Order confirmation and invoice generation
- Email delivery with PDF invoices

## Implementation Status

### ✅ Completed

1. **Cart Management** (`lib/cart/store.ts`)
   - Zustand store with localStorage persistence
   - 7-day item expiration
   - Item merging by id + color + finish combination
   - Hydration check for SSR compatibility

2. **Cart UI** (`components/shared/CartSidebar.tsx`)
   - Sliding sidebar with overlay
   - Empty state handling
   - Quantity controls
   - Price calculations (subtotal, shipping, total with VAT)
   - Free shipping over €500
   - "Proceed to Checkout" button

3. **Checkout Page** (`app/checkout/page.tsx`)
   - Customer information form (name, email, phone)
   - Delivery address fields
   - Stripe payment information
   - Order summary with cart items
   - Form validation
   - Error handling
   - Redirect to Stripe Checkout

4. **Checkout API** (`app/api/checkout/route.ts`)
   - Creates Stripe Checkout Session
   - Stores customer metadata
   - Generates line items from cart
   - Success redirect to `/order-confirmation`
   - Cancel redirect back to `/checkout`

5. **Stripe Webhook** (`app/api/webhooks/stripe/route.ts`)
   - Validates webhook signatures
   - Handles `checkout.session.completed` event
   - Creates order in database
   - Generates invoice with unique number
   - Creates PDF invoice
   - Sends email with invoice attachment
   - Updates order status to 'paid'

6. **Order Confirmation** (`app/order-confirmation/page.tsx`)
   - Displays success message
   - Shows session ID
   - Provides next steps information
   - Clears cart automatically
   - Links to account orders and products

## User Flow

```
1. User browses products → /produktai or /products
2. Clicks product → /produktai/[slug]
3. Configures options (3D configurator) 
4. Adds to cart → CartSidebar opens
5. Views cart items → Checks totals
6. Clicks "Proceed to Checkout" → /checkout
7. Fills in customer details
8. Clicks "Complete Order" → Redirects to Stripe
9. Enters payment info on Stripe Checkout
10. Completes payment
11. Redirected to /order-confirmation?session_id=...
12. Webhook processes payment → Creates order, invoice, sends email
13. User receives confirmation email with PDF invoice
```

## Technical Architecture

### Data Flow

```
Cart (Zustand) 
  → Checkout Page (collect customer data)
  → Checkout API (create Stripe session)
  → Stripe Checkout (user pays)
  → Webhook (process payment)
  → Database (create order & invoice)
  → Email Service (send invoice)
  → Order Confirmation (success page)
```

### Cart Item Structure

```typescript
interface CartItem {
  id: string;           // Product ID
  name: string;         // Product name
  slug: string;         // Product URL slug
  quantity: number;     // Item quantity
  basePrice: number;    // Price per item (EUR)
  color?: string;       // Optional color selection
  finish?: string;      // Optional finish selection
  configurationId?: string; // Optional 3D configuration
  addedAt?: number;     // Timestamp for expiry check
}
```

### Stripe Session Metadata

```typescript
{
  email: string;        // Customer email
  name: string;         // Full name
  phone: string;        // Phone number
  address: string;      // Street address
  city: string;         // City
  postalCode: string;   // Postal/ZIP code
  country: string;      // Country (default: Lietuva)
  items: string;        // JSON stringified cart items
}
```

### Webhook Event Flow

```typescript
1. Receive webhook POST from Stripe
2. Verify signature with STRIPE_WEBHOOK_SECRET
3. Extract checkout.session.completed event
4. Parse customer metadata from session
5. Call createOrder(orderData)
   - Generate unique order number (YAK-{timestamp}-{random})
   - Insert into orders table
   - Returns order with ID
6. Call createInvoice(invoiceData)
   - Generate unique invoice number (INV-{timestamp}-{random})
   - Insert into invoices table
   - Returns invoice with ID
7. Generate PDF invoice using InvoicePDFGenerator
   - Company details
   - Customer details
   - Line items table
   - Totals (subtotal, shipping, VAT, total)
   - Payment info
8. Send email via Resend
   - To: customer email
   - From: Yakiwood <info@yakiwood.lt>
   - Subject: Order confirmation
   - Attachments: PDF invoice
9. Update order status to 'paid'
10. Return 200 OK to Stripe
```

## Required Environment Variables

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...              # Stripe secret API key
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signing secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Public key (optional)

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000 # Base URL for redirects

# Email Service (Resend)
RESEND_API_KEY=re_...                      # Resend API key

# Sanity CMS (if used for product data)
NEXT_PUBLIC_SANITY_PROJECT_ID=...
NEXT_PUBLIC_SANITY_DATASET=production
```

## Testing the Flow

### 1. Local Development Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Add your Stripe keys to .env.local
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# RESEND_API_KEY=re_...
# NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Start dev server
npm run dev
```

### 2. Test Webhook Locally

**Option A: Stripe CLI (Recommended)**

```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# You'll get a webhook signing secret - add to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Option B: ngrok**

```bash
# Install ngrok from https://ngrok.com/download

# Start ngrok
ngrok http 3000

# Use ngrok URL in Stripe webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/stripe
```

### 3. Test Payment

1. Navigate to http://localhost:3000
2. Browse to a product page
3. Add item to cart
4. Click cart icon → CartSidebar opens
5. Click "Proceed to Checkout"
6. Fill in customer details:
   - Email: test@example.com
   - Name: Test User
   - Phone: +370 600 00000
   - Address: Test Street 123
   - City: Vilnius
   - Postal Code: 12345
7. Click "Complete Order"
8. Should redirect to Stripe Checkout
9. Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
10. Complete payment
11. Should redirect to `/order-confirmation?session_id=...`
12. Check console/logs for webhook processing
13. Check email inbox for invoice (if Resend configured)

### Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0027 6000 3184`
- **Insufficient funds**: `4000 0000 0000 9995`

More test cards: https://stripe.com/docs/testing

## Database Schema

### Orders Table

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR UNIQUE NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_phone VARCHAR,
  shipping_address JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  payment_status VARCHAR DEFAULT 'unpaid',
  stripe_session_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id),
  customer_email VARCHAR NOT NULL,
  customer_name VARCHAR NOT NULL,
  customer_address JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR,
  paid BOOLEAN DEFAULT FALSE,
  pdf_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP
);
```

## Error Handling

### Common Errors

1. **"Missing Stripe keys"**
   - Ensure `STRIPE_SECRET_KEY` is set in `.env.local`
   - Check key format: starts with `sk_test_` or `sk_live_`

2. **"Webhook signature verification failed"**
   - Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
   - For local testing, use Stripe CLI secret
   - Check webhook endpoint URL is correct

3. **"Email not sending"**
   - Verify `RESEND_API_KEY` is set
   - Check Resend dashboard for delivery logs
   - Ensure sender email is verified (production)

4. **"Order not created"**
   - Check database connection (Supabase)
   - Verify webhook is receiving events (Stripe dashboard)
   - Check server logs for errors

5. **"Redirect URL not working"**
   - Verify `NEXT_PUBLIC_SITE_URL` is set correctly
   - Must include protocol: `https://` or `http://`
   - No trailing slash

## Monitoring & Debugging

### Stripe Dashboard

Monitor payments and webhooks:
- Payments: https://dashboard.stripe.com/payments
- Webhooks: https://dashboard.stripe.com/webhooks
- Logs: https://dashboard.stripe.com/logs

### Resend Dashboard

Monitor email delivery:
- Emails: https://resend.com/emails
- Logs: https://resend.com/logs

### Application Logs

```bash
# Development - watch console
npm run dev

# Check webhook logs specifically
# Look for "Processing Stripe webhook event" messages
```

### Test Webhook Manually

```bash
# Send test webhook event
stripe trigger checkout.session.completed

# Or use Stripe Dashboard:
# Webhooks > Select endpoint > Send test webhook
```

## Security Considerations

1. **Webhook Signature Verification**
   - Always verify signatures with `stripe.webhooks.constructEvent()`
   - Never process unverified webhook events
   - Use correct webhook secret (different for CLI vs dashboard)

2. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different keys for test/production
   - Rotate secrets regularly

3. **API Route Protection**
   - Checkout API is public (needed for checkout)
   - Webhook endpoint must be public
   - Admin APIs should be protected

4. **Data Validation**
   - Validate customer input on checkout form
   - Sanitize data before database insertion
   - Verify amounts match cart totals

## Production Deployment

### Pre-launch Checklist

- [ ] Switch to Stripe live keys (`sk_live_...`, `pk_live_...`)
- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Configure production webhook endpoint in Stripe
- [ ] Verify domain in Resend for email sending
- [ ] Test complete flow on production
- [ ] Configure monitoring/alerting
- [ ] Review Stripe compliance requirements
- [ ] Set up automated backups

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `STRIPE_SECRET_KEY` (live key)
   - `STRIPE_WEBHOOK_SECRET` (production webhook)
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_SITE_URL` (production domain)
   - All other required variables
4. Deploy
5. Configure Stripe webhook to production URL
6. Test end-to-end

## Future Enhancements

### Planned Features

1. **Order Tracking**
   - Email notifications for order status changes
   - Track shipment integration
   - Customer order history page

2. **Enhanced Payment Options**
   - Apple Pay / Google Pay
   - SEPA Direct Debit
   - Buy Now Pay Later (Klarna, Affirm)

3. **Inventory Management**
   - Real-time stock tracking
   - Low stock alerts
   - Auto-reserve on checkout

4. **Customer Accounts**
   - Saved addresses
   - Saved payment methods
   - Order history
   - Reorder functionality

5. **Advanced Features**
   - Discount codes
   - Gift cards
   - Subscription products
   - Multi-currency support

### Known Limitations

1. Cart is client-side only (no server sync for guest users)
2. No partial refund support yet
3. Single currency (EUR) only
4. No tax calculation for different regions
5. Shipping cost is flat rate (free over €500, else €15)

## Troubleshooting Guide

### Issue: Payment succeeds but no email received

**Possible causes:**
- Resend API key not configured
- Email going to spam folder
- Domain not verified (production)

**Solution:**
1. Check Resend dashboard logs
2. Verify API key in `.env.local`
3. Check spam folder
4. For production, verify domain in Resend

### Issue: Webhook not triggering

**Possible causes:**
- Webhook URL incorrect
- Webhook secret mismatch
- Server not accessible from internet

**Solution:**
1. Verify webhook URL in Stripe dashboard
2. For local testing, use Stripe CLI or ngrok
3. Check webhook secret matches `.env.local`
4. Check server logs for incoming requests

### Issue: Order confirmation shows error

**Possible causes:**
- Invalid session ID
- Session expired
- Database connection issue

**Solution:**
1. Check URL for `session_id` parameter
2. Verify Stripe session in dashboard
3. Check database connectivity
4. Check server logs for errors

---

**Last Updated**: December 2024  
**Author**: GitHub Copilot  
**Version**: 1.0
