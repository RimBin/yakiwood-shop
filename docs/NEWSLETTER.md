# Newsletter Signup System

Complete newsletter subscription system with multiple provider support (Mailchimp, Resend, Database).

## Features

- ✅ GDPR-compliant consent checkbox
- ✅ Email validation
- ✅ Rate limiting (3 attempts per hour per email)
- ✅ Multiple provider support (Mailchimp, Resend, Supabase)
- ✅ Success/error messaging
- ✅ Loading states
- ✅ Optional name field
- ✅ Multiple variants (footer, inline, modal)
- ✅ Lithuanian language support

## Setup

### 1. Database Setup (Required for database provider)

Run the migration to create the `newsletter_subscribers` table:

```bash
# Using Supabase CLI
supabase migration up

# Or apply manually through Supabase dashboard
# Copy content from supabase/migrations/004_newsletter_subscribers.sql
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# Choose your provider
NEWSLETTER_PROVIDER=database # Options: mailchimp, resend, database

# If using Mailchimp
MAILCHIMP_API_KEY=your_api_key
MAILCHIMP_AUDIENCE_ID=your_audience_id
MAILCHIMP_SERVER_PREFIX=us19

# If using Resend
RESEND_API_KEY=your_api_key
RESEND_AUDIENCE_ID=your_audience_id

# If using database provider (or as fallback)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Provider Configuration

#### Mailchimp Setup

1. Go to Mailchimp → Audience → Settings → Audience name and defaults
2. Copy your Audience ID
3. Create API key at Account → Extras → API keys
4. Note your server prefix (e.g., `us19` from `https://us19.admin.mailchimp.com`)

#### Resend Setup

1. Go to Resend Dashboard → Audiences
2. Create an audience and copy the ID
3. Create API key at Settings → API Keys

#### Database Provider

Uses Supabase as storage. No additional setup needed if Supabase is configured.

## Usage

### Basic Footer Usage

```tsx
import NewsletterSignup from '@/components/NewsletterSignup';

export default function Footer() {
  return (
    <footer>
      <NewsletterSignup variant="footer" showTitle={true} />
    </footer>
  );
}
```

### Inline Usage

```tsx
<NewsletterSignup 
  variant="inline" 
  showTitle={false}
  className="bg-[#EAEAEA] p-6 rounded-[24px]"
/>
```

### Modal Usage

```tsx
<NewsletterSignup 
  variant="modal" 
  showTitle={true}
/>
```

## API Endpoints

### Subscribe to Newsletter

**POST** `/api/newsletter`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe", // optional
  "consent": true, // required
  "source": "footer" // optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sėkmingai užsiprenumeravote naujienas!"
}
```

**Error Response (400/429/500):**
```json
{
  "success": false,
  "error": "Error message in Lithuanian"
}
```

## Rate Limiting

- **Limit**: 3 subscription attempts per email per hour
- **Storage**: In-memory (resets on server restart)
- **Upgrade**: For production, consider Redis or database-backed rate limiting

## Database Schema

```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ,
  consent BOOLEAN,
  status TEXT, -- active, unsubscribed, bounced, pending
  source TEXT, -- footer, modal, popup, inline
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB
);
```

## Provider Architecture

The system uses a provider pattern for flexibility:

```typescript
interface NewsletterProvider {
  subscribe(email: string, data?: NewsletterData): Promise<SubscribeResult>;
}
```

### Adding a New Provider

1. Create provider class in `lib/newsletter/providers.ts`:

```typescript
export class CustomProvider implements NewsletterProvider {
  async subscribe(email: string, data?: NewsletterData) {
    // Implementation
    return { success: true };
  }
}
```

2. Add to factory function:

```typescript
export function getNewsletterProvider(): NewsletterProvider {
  switch (provider) {
    case 'custom':
      return new CustomProvider();
    // ...
  }
}
```

3. Update environment variables

## Customization

### Styling

Component uses Tailwind classes matching the design system:
- Font: `DM_Sans`
- Colors: `#161616` (black), `#E1E1E1` (border), `#BBBBBB` (placeholder)
- Border radius: `12px` for inputs, `100px` for button

### Translations

All text is in Lithuanian. To add translations:

1. Extract strings to `messages/lt.json`:
```json
{
  "newsletter": {
    "title": "Gaukite naujienas",
    "placeholder": "Jūsų el. paštas",
    "consent": "Sutinku gauti naujienas"
  }
}
```

2. Use `useTranslations` hook in component

## Testing

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","consent":true}'
```

## Troubleshooting

### "Failed to initialize newsletter provider"

- Check environment variables are set correctly
- Verify provider name matches: `mailchimp`, `resend`, or `database`
- For database provider, ensure Supabase credentials are valid

### "Rate limit exceeded"

- Wait 1 hour before retrying
- Clear server cache: restart dev server
- For production: implement Redis-based rate limiting

### Mailchimp "Member Exists" error

This is expected when email is already subscribed. The API returns a friendly message.

### Database provider not saving

- Verify migration was applied: check Supabase dashboard
- Check RLS policies allow inserts
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)

## Production Checklist

- [ ] Choose and configure newsletter provider
- [ ] Apply database migration if using database provider
- [ ] Set all required environment variables
- [ ] Test signup flow end-to-end
- [ ] Implement unsubscribe functionality
- [ ] Set up email templates for double opt-in (if required)
- [ ] Configure Redis for rate limiting (optional)
- [ ] Add analytics tracking for signups
- [ ] Test GDPR compliance
- [ ] Add reCAPTCHA for spam protection (optional)

## Future Enhancements

- [ ] Double opt-in email confirmation
- [ ] Unsubscribe page (`/naujienos/atsisako`)
- [ ] Admin dashboard for subscribers
- [ ] Export subscribers to CSV
- [ ] Segment subscribers by source/tags
- [ ] A/B testing for signup forms
- [ ] Integration with email marketing automation
- [ ] Preference center for subscription types

## License

Part of yakiwood-website project.
