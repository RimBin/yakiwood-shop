# Environment setup

This project uses `.env.local` for local development and platform environment variables (e.g. Vercel) for production.

## Quick start

1. Copy example file:
   - `cp .env.example .env.local`
2. Fill in real values
3. Validate:
   - `npm run env:check --strict`

## Production minimum (recommended)

These are the variables you typically need in production:

- `NEXT_PUBLIC_SITE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for webhook order/inventory automation)
- `ADMIN_EMAILS`

Email (choose one):

- Resend: `RESEND_API_KEY` + `SYSTEM_EMAIL_FROM`
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (+ optional `SMTP_FROM`)

Sanity (if using CMS content):

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`
- Optional: `SANITY_API_TOKEN` (private dataset / authenticated requests)

## Notes

- Never expose `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser (do not prefix with `NEXT_PUBLIC_`).
- `NEXT_PUBLIC_SITE_URL` is used for absolute URLs (Stripe success/cancel redirects, OG images, sitemap).
