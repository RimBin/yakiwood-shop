# 🎯 SUPABASE SETUP - SANTRAUKA

Viskas paruošta automatiniam Supabase konfigūravimui!

## 📦 Kas Sukurta

### 1. Automatizacijos Scriptas
**Failas:** `scripts/setup-supabase.ps1`

Automatiškai:
- ✅ Sukuria/patikrina `.env.local` failą
- ✅ Paprašo įvesti Supabase kredencialus
- ✅ Atnaujina `.env.local` su tikrais kredencialais
- ✅ Pateikia žingsnius database setup'ui
- ✅ Veda per visą setup procesą (7 žingsniai)

**Kaip Paleisti:**
```powershell
.\scripts\setup-supabase.ps1
```

---

### 2. Database Migration
**Failas:** `supabase/migrations/20241122_init_schema.sql`

Atnaujintas su naujomis lentelėmis:
- ✅ `user_profiles` - Vartotojų profiliai (email, full_name, phone, role)
- ✅ `delivery_addresses` - Pristatymo adresai
- ✅ RLS policies visiems
- ✅ Triggers updated_at laukams

**Lentelės:**
- products
- product_variants
- custom_configurations
- orders
- order_items
- cart_items
- **user_profiles** (NAUJA)
- **delivery_addresses** (NAUJA)

---

### 3. Demo Accounts Setup
**Failas:** `supabase/setup-demo-accounts.sql`

Patobulinta versija:
- ✅ Automatiškai nustato roles pagal email
- ✅ Sukuria user_profiles įrašus
- ✅ Nereikia rankiniu būdu keisti UUID
- ✅ Verification query pabaigoje

**Demo Credentials:**
- Admin: `admin@yakiwood.lt` / `demo123456`
- User: `user@yakiwood.lt` / `demo123456`

---

### 4. Account Page su Supabase
**Failas:** `app/account/page.tsx`

Pilnai integruota su Supabase:
- ✅ Authentication check (redirect į /login jei ne logged in)
- ✅ Load user profile data
- ✅ Update personal info
- ✅ Save/Update delivery address
- ✅ Change password
- ✅ Sign out funkcionalumas
- ✅ Error/Success pranešimai
- ✅ Loading state

---

### 5. Environment Template
**Failas:** `.env.local.example`

Pavyzdys su visais reikalingais env vars:
- Supabase (URL, keys, bucket)
- Admin emails
- Resend API (optional)
- Stripe (optional)

---

### 6. Greitas Vadovas
**Failas:** `SUPABASE_QUICKSTART.md`

10-minučių setup guide lietuviškai:
- ✅ 6 aiškūs žingsniai
- ✅ Screenshots/instrukcijos
- ✅ Troubleshooting sekcija
- ✅ Checklist po setup'o
- ✅ Emoji vizualizacija

---

### 7. Detali Dokumentacija
**Failas:** `SUPABASE_SETUP.md`

Išsami 300+ eilučių instrukcija:
- Prerequisites
- Step-by-step setup
- Database migrations
- Storage bucket
- Demo accounts
- RLS policies
- Testing
- Production checklist
- Troubleshooting

---

## 🚀 Kaip Pradėti (3 Būdai)

### Būdas 1: Automatinis (REKOMENDUOJAMAS)
```powershell
# 1. Sukurk Supabase projektą: https://supabase.com/dashboard
# 2. Paleisk scriptą:
.\scripts\setup-supabase.ps1
# 3. Sek ekrane rodomą instrukcijų
```

### Būdas 2: Greitas (10 min)
```powershell
# Skaityk ir sek: SUPABASE_QUICKSTART.md
# Aiškūs 6 žingsniai lietuviškai
```

### Būdas 3: Detalus (30 min)
```powershell
# Skaityk: SUPABASE_SETUP.md
# Išsami dokumentacija su paaiškinimais
```

---

## ✅ Greitas Checklist

Prieš testą įsitikink:

- [ ] **Supabase projektas** sukurtas
- [ ] **Kredencialai** gauti (URL, Anon Key, Service Key)
- [ ] **Setup scriptas** paleistas (`.\scripts\setup-supabase.ps1`)
- [ ] `.env.local` **užpildytas** su tikrais kredencialais
- [ ] **Migration** paleista (`20241122_init_schema.sql`)
- [ ] **Storage bucket** sukurtas (`product-images`)
- [ ] **Demo users** sukurti Authentication UI
- [ ] **Roles** nustatytos (`setup-demo-accounts.sql`)
- [ ] **Dev serveris** veikia (`npm run dev`)
- [ ] **Login page** atidarytas (http://localhost:3000/login)
- [ ] **Demo login** testuotas (Admin ir User)

---

## 🎯 Po Setup - Testuokime!

### 1. Login Test:
```
http://localhost:3000/login

Spausk:
✅ "Demo Login - Admin" → /admin
✅ "Demo Login - User" → /account
```

### 2. Admin Test:
```
/admin

Išbandyk:
✅ Sukurti produktą
✅ Pridėti variantus
✅ Upload'inti paveikslėlį
✅ Matyti produktų sąrašą
```

### 3. User Test:
```
/account

Išbandyk:
✅ Redaguoti profilio info
✅ Pridėti pristatymo adresą
✅ Keisti slaptažodį
✅ Sign out
```

---

## 📁 Failų Struktūra

```
yakiwood-website/
├── scripts/
│   └── setup-supabase.ps1           ← Automatinis setup scriptas
├── supabase/
│   ├── migrations/
│   │   └── 20241122_init_schema.sql ← Database schema
│   └── setup-demo-accounts.sql      ← Demo users setup
├── app/
│   ├── login/page.tsx               ← Login su demo buttons
│   ├── admin/page.tsx               ← Admin dashboard (jau buvo)
│   └── account/page.tsx             ← User account (atnaujinta)
├── .env.local                       ← Tavo kredencialai (necommit!)
├── .env.local.example               ← Template
├── SUPABASE_QUICKSTART.md           ← 10 min vadovas
└── SUPABASE_SETUP.md                ← Detali instrukcija
```

---

## 🔗 API Endpoints (Jau Egzistuoja)

Visi reikalingi endpoints jau sukurti:

| Endpoint | Metodas | Aprašymas |
|----------|---------|-----------|
| `/api/products` | GET | Gauti produktų sąrašą |
| `/api/admin/products` | POST | Sukurti produktą |
| `/api/admin/products/[id]` | PUT/DELETE | Update/Delete produktą |
| `/api/admin/uploads` | POST | Gauti signed URL upload'ui |
| `/api/admin/email` | POST | Siųsti email (Resend) |
| `/api/checkout` | POST | Stripe checkout session |

---

## 🎨 Funkcionalumas

### Veikia:
- ✅ Login su demo accounts
- ✅ Admin dashboard
- ✅ Product CRUD
- ✅ Variant management
- ✅ Image uploads
- ✅ User account management
- ✅ Delivery addresses
- ✅ Password change
- ✅ Session management
- ✅ RLS security

### Neprivaloma (galima pridėti vėliau):
- ⏳ Email notifications (Resend API)
- ⏳ Stripe payments
- ⏳ Order tracking
- ⏳ Product reviews
- ⏳ 3D configurator GLTF models

---

## 🐛 Troubleshooting Quick Fixes

### 1. "Missing env vars"
```powershell
.\scripts\setup-supabase.ps1
# Įvesk kredencialus iš naujo
```

### 2. "Invalid credentials"
```sql
-- Patikrink SQL Editor:
SELECT email, raw_user_meta_data->>'role'
FROM auth.users
WHERE email IN ('admin@yakiwood.lt', 'user@yakiwood.lt');
```

### 3. "Upload failed"
```
Storage → Buckets → product-images
Public: YES, Size: 5MB
```

### 4. Dev serveris neveikia
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 📞 Reikia Pagalbos?

**Paprastos problemos:**
→ Skaityk `SUPABASE_QUICKSTART.md` troubleshooting

**Technines problemas:**
→ Skaityk `SUPABASE_SETUP.md` detali troubleshooting

**Klaidos kode:**
→ Pažiūrėk browser console (F12)
→ Pažiūrėk terminal output (`npm run dev`)
→ Pažiūrėk Supabase logs (Logs → Postgres Logs)

---

## 🎉 Viso Geriausio!

Jei viskas sekėsi:
- ✅ Supabase integruota
- ✅ Demo accounts veikia
- ✅ Admin gali valdyti produktus
- ✅ Users gali redaguoti profilį
- ✅ Images upload'inasi į Storage
- ✅ RLS security įjungta

**Dabar galite:**
1. Pradėti kurti tikrus produktus
2. Testuoti visą authentication flow
3. Integruoti Stripe (optional)
4. Integruoti Resend email (optional)
5. Deploy'inti į production (Vercel)

---

**Sėkmės! 🚀🪵🎨**

*Jei turite klausimų - žiūrėkite documentation arba Supabase Dashboard logs.*
