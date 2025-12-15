# Newsletter Quickstart Guide

Get your newsletter system up and running in 5 minutes.

## Quick Setup (Database Provider)

### 1. Apply Database Migration

```bash
# Navigate to Supabase dashboard
# Go to SQL Editor
# Copy and paste content from: supabase/migrations/004_newsletter_subscribers.sql
# Click "Run"
```

### 2. Add Environment Variable

Add to `.env.local`:

```bash
NEWSLETTER_PROVIDER=database
```

(Supabase variables should already be configured from project setup)

### 3. Add Component to Footer

Edit your footer component (e.g., `components/Footer.tsx`):

```tsx
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Your existing footer content */}
        
        {/* Add newsletter signup */}
        <div className="mt-8">
          <NewsletterSignup variant="footer" showTitle={true} />
        </div>
      </div>
    </footer>
  );
}
```

### 4. Test It

```bash
npm run dev
```

Visit your site, scroll to footer, and test the newsletter signup!

---

## Using Mailchimp Instead

### 1. Get Mailchimp Credentials

1. Log in to Mailchimp
2. Go to **Audience** → **Settings** → **Audience name and defaults**
3. Copy your **Audience ID**
4. Go to **Account** → **Extras** → **API keys**
5. Create new API key and copy it
6. Note your server prefix (e.g., `us19` from URL `https://us19.admin.mailchimp.com`)

### 2. Update Environment Variables

Add to `.env.local`:

```bash
NEWSLETTER_PROVIDER=mailchimp

MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here
MAILCHIMP_SERVER_PREFIX=us19
```

### 3. Test It

```bash
npm run dev
```

Newsletter signups will now go directly to Mailchimp!

---

## Using Resend

### 1. Get Resend Credentials

1. Log in to Resend
2. Go to **Audiences** and create one
3. Copy the **Audience ID**
4. Go to **Settings** → **API Keys**
5. Create new API key and copy it

### 2. Update Environment Variables

Add to `.env.local`:

```bash
NEWSLETTER_PROVIDER=resend

RESEND_API_KEY=your_api_key_here
RESEND_AUDIENCE_ID=your_audience_id_here
```

### 3. Test It

```bash
npm run dev
```

---

## Testing the API Directly

### Test Subscription

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Jonas Jonaitis",
    "consent": true,
    "source": "test"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sėkmingai užsiprenumeravote naujienas!"
}
```

### Test Rate Limiting

Run the same command 4 times quickly - the 4th request should return:

```json
{
  "success": false,
  "error": "Per daug bandymų. Bandykite vėliau."
}
```

---

## Viewing Subscribers (Database Provider)

### In Supabase Dashboard

1. Go to **Table Editor**
2. Select `newsletter_subscribers` table
3. View all subscribers with their details

### Via SQL Query

```sql
SELECT 
  email, 
  name, 
  subscribed_at, 
  status, 
  source 
FROM newsletter_subscribers 
WHERE status = 'active'
ORDER BY subscribed_at DESC;
```

---

## Common Issues

### "Failed to initialize newsletter provider"

**Solution:** Check that environment variables are set correctly for your chosen provider.

```bash
# Verify variables are loaded
npm run dev

# Check terminal output for any errors
```

### Newsletter not showing up

**Solution:** Make sure you imported and rendered the component:

```tsx
import NewsletterSignup from '@/components/NewsletterSignup';

// In your JSX:
<NewsletterSignup variant="footer" />
```

### Styling looks wrong

**Solution:** Ensure Tailwind is processing the component. The component uses design system colors and fonts defined in the project.

### Database errors

**Solution:** 
1. Verify migration was applied in Supabase dashboard
2. Check RLS policies allow inserts
3. Ensure service role key is set (not just anon key)

---

## Next Steps

✅ Newsletter component is working
✅ Subscribers are being saved

**Now you can:**

1. **Add to other pages**: Use `variant="inline"` for product pages
2. **Create modal popup**: Use `variant="modal"` with a modal component
3. **Send newsletters**: Export subscribers and send via Mailchimp/Resend
4. **Add unsubscribe page**: Create `/naujienos/atsisako` page
5. **View analytics**: Track signup sources in Supabase or Mailchimp

---

## Component Variants

### Footer (default)
```tsx
<NewsletterSignup variant="footer" showTitle={true} />
```

### Inline (for pages)
```tsx
<div className="bg-[#EAEAEA] p-8 rounded-[24px]">
  <NewsletterSignup 
    variant="inline" 
    showTitle={true}
    className="max-w-md mx-auto"
  />
</div>
```

### Modal
```tsx
<dialog open>
  <NewsletterSignup variant="modal" showTitle={true} />
</dialog>
```

---

## Questions?

See full documentation: [docs/NEWSLETTER.md](./NEWSLETTER.md)

Or check the example implementation: [components/FooterExample.tsx](../components/FooterExample.tsx)
