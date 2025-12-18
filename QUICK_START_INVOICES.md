# 🚀 Greitas Startas - Automatinė Sąskaitų Sistema

## ⚡ 5 Žingsniai iki Veikimo

### 1️⃣ Aplinkos Kintamieji

Pridėti į `.env.local`:

```bash
# Stripe (būtina!)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (būtina!)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Resend Email (būtina!)
RESEND_API_KEY=re_...
```

### 2️⃣ Duomenų Bazės Migracija

**Supabase Dashboard:**
1. Eiti į SQL Editor
2. Nukopijuoti turinį iš `supabase/migrations/20241218_orders_and_invoices.sql`
3. Paleisti SQL query

**ARBA naudoti CLI:**
```bash
npx supabase migration up
```

### 3️⃣ Stripe Webhook Setup

**Development:**
```bash
# Instaliuoti Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Nukopijuoti whsec_... į .env.local kaip STRIPE_WEBHOOK_SECRET
```

**Production (Vercel):**
1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select event: `checkout.session.completed`
4. Copy signing secret → Vercel env vars

### 4️⃣ Įmonės Duomenų Redagavimas

Redaguoti `lib/invoice/utils.ts` → `DEFAULT_INVOICE_SETTINGS`:

```typescript
seller: {
  name: 'UAB "JŪSŲ ĮMONĖ"',
  companyCode: '123456789',
  vatCode: 'LT123456789012',
  address: 'Jūsų adresas',
  // ... kiti laukai
}
```

### 5️⃣ Paleisti Dev Server

```bash
npm run dev
```

## ✅ Patikrinkite, ar Veikia

### Testuoti Checkout:

```typescript
// Frontend button
const handleCheckout = async () => {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { id: '1', name: 'Test Product', quantity: 1, basePrice: 50 }
      ],
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      customerPhone: '+370 600 00000',
      customerAddress: 'Test Address, Vilnius'
    })
  });
  
  const { url } = await res.json();
  window.location.href = url; // Redirect į Stripe
};
```

### Stripe Test Kortelė:

```
4242 4242 4242 4242
Exp: 12/34
CVC: 123
```

### Peržiūrėti Rezultatą:

1. **Admin Dashboard**: `/admin/orders`
2. **Webhook Logs**: Terminal su `stripe listen`
3. **Email**: Patikrinti Resend Dashboard ar išsiųsta

## 📧 El. Pašto Konfigūracija

### Resend Setup:

1. Eiti į [resend.com](https://resend.com)
2. Sign up / Login
3. API Keys → Create API Key
4. Nukopijuoti į `.env.local`

### Domain Verification (Production):

1. Resend Dashboard → Domains → Add Domain
2. Pridėti TXT/DKIM records į DNS
3. Verify domain
4. Keisti `from: 'Yakiwood <info@yakiwood.lt>'` į savo domainą

## 🐛 Jei Neveikia

### Webhook nesulaukia:

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Stripe forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

### Email neišsiunčia:

```bash
# Test Resend connection
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

### DB klaida:

```bash
# Patikrinti Supabase connection
npx supabase status

# Arba tiesiogiai Dashboard → SQL Editor ir paleisti migracijas
```

## 📚 Pilna Dokumentacija

Detalūs instrukcijai: [AUTOMATIC_INVOICES.md](AUTOMATIC_INVOICES.md)

---

**Pagalba**: Jei kažkas neveikia, patikrinkite:
1. Ar visi env vars nustatyti?
2. Ar Stripe webhook forwarding veikia?
3. Ar DB migracija pavyko?
4. Ar Resend API key galioja?
