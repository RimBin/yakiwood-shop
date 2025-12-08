# 🚀 Yakiwood Supabase - Greitas Setup

**Laikas:** 10 minučių | **Sudėtingumas:** Lengvas

## Prieš Pradedant

Reikalinga:
- ✅ Supabase account (nemokamas): https://supabase.com
- ✅ Node.js ir npm įdiegti
- ✅ Projekto failai nukopijuoti

## 🎯 Setup Žingsniai

### 1️⃣ Sukurti Supabase Projektą (3 min)

```
📍 Eik į: https://supabase.com/dashboard
```

1. Spausk **"New Project"**
2. Užpildyk formas:
   - **Name:** `yakiwood-shop`
   - **Database Password:** Sugalvok stiprų slaptažodį (išsaugok!)
   - **Region:** `Europe (Germany)` arba `Europe (Netherlands)`
3. Spausk **"Create new project"**
4. ⏳ Palaukite ~2 minutes kol projektas pasiruošia

---

### 2️⃣ Gauti API Kredencialus (1 min)

```
📍 Project Settings → API
```

Nukopijuok šias 3 vertes:

| Pavadinimas | Pavyzdys | Kur Rasti |
|-------------|----------|-----------|
| **Project URL** | `https://abc123xyz.supabase.co` | "Project URL" laukas |
| **Anon Key** | `eyJhbGc...` | "Project API keys" → "anon public" |
| **Service Role Key** | `eyJhbGc...` | "Project API keys" → "service_role" |

⚠️ **Service Role Key - SAUGOK SLAPTAI!** (niekada necommit'ink į Git)

---

### 3️⃣ Paleisti Automatinį Setup Scriptą (30 sec)

```powershell
# PowerShell
cd c:\Users\rimvy\yakiwood-website
.\scripts\setup-supabase.ps1
```

Scriptas paklaus:

```
Enter SUPABASE_URL: [įklijuok Project URL]
Enter SUPABASE_ANON_KEY: [įklijuok Anon Key]
Enter SUPABASE_SERVICE_ROLE_KEY: [įklijuok Service Role Key]
```

✅ Scriptas automatiškai atnaujins `.env.local` failą

---

### 4️⃣ Sukurti Database Schema (2 min)

```
📍 https://[TAVO-PROJECT].supabase.co/project/default/sql/new
```

1. Atidaryk failą: `supabase\migrations\20241122_init_schema.sql`
2. **Copy** VISĄ failo turinį (Ctrl+A, Ctrl+C)
3. **Paste** į Supabase SQL Editor
4. Spausk **"RUN"** (apačioje dešinėje)
5. ✅ Turėtum matyti: `"Success. No rows returned"`

**Kas įvyko:** Sukurtos lentelės:
- `products` - Produktų katalogas
- `product_variants` - Spalvos, finišai, dydžiai
- `orders` - Užsakymai
- `cart_items` - Krepšelis
- `user_profiles` - Vartotojų profiliai
- `delivery_addresses` - Pristatymo adresai

---

### 5️⃣ Sukurti Storage Bucket (1 min)

```
📍 Storage → Create new bucket
```

Užpildyk:

| Laukas | Vertė |
|--------|-------|
| **Name** | `product-images` |
| **Public bucket** | ✅ **YES** (būtinai!) |
| **File size limit** | `5 MB` |
| **Allowed MIME types** | `image/*` |

Spausk **"Create bucket"**

---

### 6️⃣ Sukurti Demo Vartotojus (3 min)

#### A) Sukurti Users Authentication'e:

```
📍 Authentication → Users → Add user → Create new user
```

**1. ADMIN:**
```
Email: admin@yakiwood.lt
Password: demo123456
Auto Confirm User: ✅ (BŪTINAI pažymėti!)
```
→ **Create user**

**2. USER:**
```
Email: user@yakiwood.lt
Password: demo123456
Auto Confirm User: ✅ (BŪTINAI pažymėti!)
```
→ **Create user**

#### B) Nustatyti Roles:

```
📍 SQL Editor → New Query
```

1. Atidaryk: `supabase\setup-demo-accounts.sql`
2. **Copy** visą turinį
3. **Paste** į SQL Editor
4. **RUN**
5. ✅ Turėtum matyti 2 įrašus rezultate:
   ```
   admin@yakiwood.lt | admin  | Demo Admin
   user@yakiwood.lt  | user   | Demo User
   ```

---

## 🎉 PABAIGA! Testuokime

### Paleisti Serverį:

```powershell
npm run dev
```

### Atidaryti Login:

```
http://localhost:3000/login
```

### Demo Prisijungimai:

| Rolė | Email | Slaptažodis | Redirect |
|------|-------|-------------|----------|
| **Admin** | admin@yakiwood.lt | demo123456 | `/admin` |
| **User** | user@yakiwood.lt | demo123456 | `/account` |

**Paprastas būdas:** Spausk mygtukus:
- **"Demo Login - Admin"** → Admin dashboard
- **"Demo Login - User"** → User profile

---

## ✅ Patikrinimo Checklist

Įsitikink, kad:

- [ ] Supabase projektas sukurtas
- [ ] `.env.local` failas užpildytas su tikrais kredencialais
- [ ] `20241122_init_schema.sql` paleista (lentelės sukurtos)
- [ ] `product-images` bucket sukurtas Storage
- [ ] 2 demo users sukurti Authentication UI
- [ ] `setup-demo-accounts.sql` paleista (roles nustatytos)
- [ ] Dev serveris kraunasi be klaidų (`npm run dev`)
- [ ] Login puslapis veikia (http://localhost:3000/login)
- [ ] Demo login mygtukai nukreipia į /admin ir /account

---

## 🐛 Troubleshooting

### "Missing environment variables" klaida

```powershell
# Patikrink .env.local:
Get-Content .env.local | Select-String "SUPABASE"
```

Turi būti:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Fix:** Paleisk `.\scripts\setup-supabase.ps1` iš naujo

---

### "Invalid login credentials" klaida

**Patikrink ar users egzistuoja:**

```
📍 Authentication → Users
```

Turėtum matyti:
- ✅ admin@yakiwood.lt
- ✅ user@yakiwood.lt

**Patikrink ar roles nustatytos:**

```sql
-- SQL Editor:
SELECT email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email IN ('admin@yakiwood.lt', 'user@yakiwood.lt');
```

Rezultatas turi būti:
```
admin@yakiwood.lt | admin
user@yakiwood.lt  | user
```

**Fix:** Paleisk `setup-demo-accounts.sql` iš naujo

---

### "Failed to upload image" klaida

**Patikrink bucket:**

```
📍 Storage → Buckets
```

Turi būti:
- ✅ `product-images` bucket
- ✅ Public: **Yes**
- ✅ File size limit: 5 MB

**Fix:** Sukurk bucket rankiniu būdu pagal žingsnį 5

---

### Dev serveris "kraunasi amžinai"

```powershell
# Išvalyk cache ir restart:
Remove-Item -Recurse -Force .next
npm run dev
```

---

## 🎯 Kas Dabar?

### Admin Funkcionalumas (`/admin`):

✅ Kurti produktus  
✅ Pridėti variantus (spalvos, finišai, dydžiai)  
✅ Upload'inti paveikslėlius  
✅ Valdyti produktų katalogą  
✅ Nustatyti kainas ir stock  

### User Funkcionalumas (`/account`):

✅ Redaguoti profilio informaciją  
✅ Nustatyti pristatymo adresą  
✅ Keisti slaptažodį  
✅ Sign out  

---

## 📚 Papildoma Dokumentacija

| Failas | Aprašymas |
|--------|-----------|
| `SUPABASE_SETUP.md` | Detali Supabase konfigūracija |
| `README.md` | Projekto overview |
| `SETUP.md` | Bendri setup instrukcijos |

---

## 🆘 Reikia Pagalbos?

1. 📖 Perskaityk **SUPABASE_SETUP.md** troubleshooting sekciją
2. 🔍 Patikrink Supabase Logs: **Logs → Postgres Logs**
3. 🖥️ Pažiūrėk browser console: **F12 → Console**
4. 📝 Pažiūrėk terminal output kur veikia `npm run dev`

---

**Sėkmės! 🎨🪵**

Jei viskas veikia - dabar gali:
- ✅ Kurti produktus su paveikslėliais
- ✅ Valdyti variantus (spalvos, finišai)
- ✅ Testuoti admin/user flows
- ✅ Pradėti programuoti custom funkcionalumą
