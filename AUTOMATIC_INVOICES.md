# Automatinė Sąskaitų Sistema - E-commerce Integracija

## 🎯 Apžvalga

Pilnai automatizuota sąskaitų faktūrų generavimo sistema, integruota su Stripe mokėjimais. Po kiekvieno sėkmingo užsakymo automatiškai generuojama sąskaita ir išsiunčiama klientui el. paštu.

## 🔄 Automatinis Procesas

### 1. Klientas užbaigia užsakymą
```
Krepšelis → Stripe Checkout → Apmokėjimas
```

### 2. Stripe webhook pranešimas
```
checkout.session.completed → /api/webhooks/stripe
```

### 3. Sistema automatiškai:
- ✅ Sukuria užsakymą duomenų bazėje
- ✅ Generuoja sąskaitą faktūrą PDF
- ✅ Išsaugo sąskaitą į Supabase
- ✅ Išsiunčia el. laišką su PDF attachment

## 📁 Failų Struktūra

```
app/api/
  ├── checkout/route.ts              # Stripe checkout su metadata
  ├── webhooks/stripe/route.ts       # Automatinis webhook handler
  └── admin/
      ├── orders/route.ts            # Admin: užsakymų sąrašas
      └── invoices/
          ├── route.ts               # Admin: sąskaitų sąrašas
          ├── [id]/pdf/route.ts      # Admin: PDF parsisiuntimas
          └── [id]/resend/route.ts   # Admin: pakartotinis siuntimas

app/admin/orders/page.tsx            # Admin UI: užsakymai + sąskaitos

lib/
  ├── supabase-admin.ts              # DB funkcijos (CRUD)
  ├── invoice/
  │   ├── pdf-generator.ts           # PDF generavimas (jsPDF)
  │   └── utils.ts                   # Invoice logika

supabase/migrations/
  └── 20241218_orders_and_invoices.sql  # DB schema

types/invoice.ts                      # TypeScript tipai
```

## 🚀 Setup Instrukcijos

### 1. Aplinkos kintamieji (.env.local)

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (Resend)
RESEND_API_KEY=re_...
```

### 2. Supabase Migracija

```bash
# Paleisti migracijas
npx supabase migration up

# Arba importuoti SQL tiesiogiai Supabase Dashboard:
# SQL Editor → New Query → Paste turinį iš supabase/migrations/20241218_orders_and_invoices.sql
```

### 3. Stripe Webhook Konfigūracija

#### Development (local testing):
```bash
# 1. Instaliuoti Stripe CLI
brew install stripe/stripe-cli/stripe   # macOS
# arba stripe.com/docs/stripe-cli

# 2. Login
stripe login

# 3. Forward webhooks į local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 4. Nukopijuoti webhook secret (whsec_...) į .env.local
```

#### Production (Vercel):
```bash
# 1. Stripe Dashboard → Developers → Webhooks
# 2. Add endpoint: https://yourdomain.com/api/webhooks/stripe
# 3. Pasirinkti event: checkout.session.completed
# 4. Nukopijuoti Signing secret → Vercel env vars (STRIPE_WEBHOOK_SECRET)
```

### 4. Įmonės Duomenų Konfigūracija

Redaguoti [lib/invoice/utils.ts](lib/invoice/utils.ts):

```typescript
export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  seller: {
    name: 'UAB "JŪSŲ ĮMONĖ"',
    companyCode: '123456789',
    vatCode: 'LT123456789012',
    address: 'Jūsų gatvė 1',
    city: 'Vilnius',
    postalCode: '01103',
    country: 'Lietuva',
    phone: '+370 600 00000',
    email: 'info@jusuimone.lt',
    website: 'https://jusuimone.lt',
    bankName: 'Jūsų bankas',
    bankAccount: 'LT12 7300 0101 2345 6789'
  },
  invoicePrefix: 'YI',  // Jūsų įmonės prefiksas
  // ...
};
```

## 💻 Kaip veikia

### Checkout Procesas

```typescript
// Frontend krepšelio mygtukas
const handleCheckout = async () => {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartItems,                    // Prekės
      customerEmail: 'email@example.com',
      customerName: 'Jonas Jonaitis',
      customerPhone: '+370 600 00000',
      customerAddress: 'Gedimino pr. 1, Vilnius'
    })
  });

  const { url } = await response.json();
  window.location.href = url;  // Redirect į Stripe
};
```

### Webhook Automatinis Pranešimas

Po apmokėjimo Stripe siunčia webhook:

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  // 1. Patvirtinti Stripe parašą
  const event = stripe.webhooks.constructEvent(body, signature, secret);
  
  // 2. checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // 3. Sukurti užsakymą DB
    const order = await createOrder({...});
    
    // 4. Generuoti sąskaitą
    const invoice = createInvoice({...});
    await saveInvoiceToDatabase(invoice, order.id);
    
    // 5. Generuoti PDF
    const pdfBuffer = new InvoicePDFGenerator(invoice).generate();
    
    // 6. Siųsti el. paštu
    await resend.emails.send({
      to: customerEmail,
      subject: `Užsakymas ${order.order_number}`,
      attachments: [{ filename: 'saskaita.pdf', content: pdfBuffer }]
    });
  }
}
```

## 📊 Duomenų Bazės Schema

### Orders lentelė
```sql
- id (UUID, PK)
- order_number (TEXT, unikalus, pvz: YW-20241218-0001)
- stripe_session_id (TEXT)
- customer_email, customer_name, customer_phone, customer_address
- items (JSONB)
- subtotal, vat_amount, total (DECIMAL)
- status (pending | processing | completed | cancelled)
- payment_status (pending | paid | failed)
- created_at, updated_at, paid_at
```

### Invoices lentelė
```sql
- id (UUID, PK)
- invoice_number (TEXT, unikalus, pvz: YW-202412-0001)
- order_id (UUID, FK → orders.id)
- seller_* (pardavėjo duomenys)
- buyer_* (pirkėjo duomenys)
- items (JSONB)
- subtotal, vat_amount, total (DECIMAL)
- status (draft | issued | paid | overdue | cancelled)
- issued_at, due_date, paid_at
- payment_method (bank_transfer | cash | card | stripe)
- notes, pdf_url
```

## 👨‍💼 Admin Funkcijos

### Peržiūrėti užsakymus ir sąskaitas

URL: `/admin/orders`

**Funkcionalumas:**
- ✅ Du tabai: Užsakymai | Sąskaitos
- ✅ Filtravimas pagal būseną
- ✅ Realiaus laiko duomenys iš Supabase
- ✅ PDF parsisiuntimas
- ✅ Pakartotinis el. pašto siuntimas

### API Endpoints

```bash
# Gauti visus užsakymus
GET /api/admin/orders
→ { orders: [...] }

# Gauti visas sąskaitas
GET /api/admin/invoices
→ { invoices: [...] }

# Parsisiųsti PDF
GET /api/admin/invoices/{id}/pdf
→ PDF file download

# Pakartotinai išsiųsti sąskaitą
POST /api/admin/invoices/{id}/resend
→ { success: true }
```

## 🧪 Testavimas

### 1. Local Development

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Test checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id":"1","name":"Test Product","quantity":1,"basePrice":50}],
    "customerEmail":"test@example.com",
    "customerName":"Test User"
  }'
```

### 2. Stripe Test Cards

```
4242 4242 4242 4242  ✅ Sėkmė
4000 0000 0000 0002  ❌ Declined
4000 0025 0000 3155  🔐 3D Secure
```

### 3. Webhook Testing

```bash
# Trigger test webhook
stripe trigger checkout.session.completed

# Peržiūrėti webhook logs
stripe logs tail
```

## 📧 El. Pašto Šablonas

Klientas gauna el. laišką su:

```
✅ Užsakymo numeris
✅ Sąskaitos numeris
✅ Užsakytų prekių sąrašas
✅ Bendra suma
✅ Apmokėjimo būsena
✅ PDF attachment
```

**Email subject:**
```
Užsakymas YW-20241218-0001 - Sąskaita faktūra YW-202412-0001
```

## 🔧 Troubleshooting

### Webhook nesulaukia pranešimų

```bash
# Patikrinti, ar veikia Stripe CLI forwarding
stripe listen --print-secret

# Patikrinti webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

### El. laiškas neišsiunčiamas

```bash
# Patikrinti Resend API key
curl https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@example.com","to":"test@example.com","subject":"Test"}'
```

### Sąskaita nesaugoma DB

```bash
# Patikrinti Supabase connection
npx supabase status

# Patikrinti service role key
echo $SUPABASE_SERVICE_ROLE_KEY
```

### PDF generavimo klaida

```typescript
// Patikrinti jsPDF instaliacijos
npm list jspdf jspdf-autotable

// Pabandyti iš naujo
npm install --legacy-peer-deps jspdf jspdf-autotable
```

## 📈 Production Deployment

### Vercel Deployment

```bash
# 1. Push į GitHub
git add .
git commit -m "feat: automatic invoice system"
git push origin main

# 2. Vercel Dashboard:
# - Import GitHub repo
# - Add environment variables (visus iš .env.local)
# - Deploy

# 3. Stripe Webhook:
# - Dashboard → Webhooks → Add endpoint
# - URL: https://yourdomain.com/api/webhooks/stripe
# - Event: checkout.session.completed
# - Copy signing secret → Vercel env (STRIPE_WEBHOOK_SECRET)
```

### Post-Deploy Checklist

- [ ] Patikrinti env variables Vercel Dashboard
- [ ] Sukonfiguruoti Stripe webhook production URL
- [ ] Patikrinti Supabase RLS policies
- [ ] Testuoti checkout flow production aplinkoje
- [ ] Patikrinti el. pašto delivery (Resend Dashboard)
- [ ] Atnaujinti įmonės duomenis PDF šablone

## 🔒 Saugumo Pastabos

1. **Webhook Secret** - BŪTINA! Be jo bet kas gali siųsti fake webhooks
2. **Service Role Key** - Niekada neeksponuoti frontend'e, tik server-side
3. **RLS Policies** - Supabase Row Level Security apsaugo duomenis
4. **Email Rate Limits** - Resend free: 100 email/day, 3000/month

## 📝 Kitas Žingsniai (TODO)

- [ ] Pridėti užsakymų tracking numerius (siuntimo info)
- [ ] SMS pranešimai per Twilio
- [ ] Sąskaitų eksportavimas į Excel
- [ ] Automatinis priminimas apie neapmokėtas sąskaitas
- [ ] Multi-language support (EN versija)
- [ ] PDF failų saugojimas Vercel Blob/S3
- [ ] Recurring invoices (prenumeratos)

## 💡 Tips

- **Testing**: Naudokite Stripe CLI local webhook forwarding
- **Logging**: Webhook'e `console.log` matysis Vercel logs
- **Debug**: Stripe Dashboard → Developers → Logs
- **Performance**: Webhook procesas < 5s (Stripe timeout)

---

**Sukurta**: 2024-12-18  
**Versija**: 1.0.0  
**Autorius**: Yakiwood Development Team
