# Kaip užbaigti Yakiwood e-parduotuvės konfigūraciją

## 🎯 Ko dar reikia

Visi pagrindiniai komponentai jau sukurti ir veikia! Lieka tik:

1. ✅ **Sukonfigūruoti Stripe** (mokėjimų sistema)
2. ✅ **Sukonfigūruoti Resend** (el. pašto siuntimas)
3. ✅ **Išbandyti mokėjimo procesą**

---

## 1️⃣ Stripe Konfigūracija (5 minutės)

### Žingsnis 1: Sukurkite Stripe paskyrą
1. Eikite į https://stripe.com
2. Paspauskite "Start now" arba "Sign up"
3. Užregistruokite paskyrą (galite naudoti testinį režimą)

### Žingsnis 2: Gaukite API raktus
1. Prisijunkite prie Stripe
2. Eikite į **Developers → API keys**
3. Pamatysite du raktus:
   - **Publishable key** (prasideda `pk_test_...`)
   - **Secret key** (prasideda `sk_test_...`) - paspauskite "Reveal"

### Žingsnis 3: Sukonfigūruokite webhook
1. Eikite į **Developers → Webhooks**
2. Paspauskite "Add endpoint"
3. Įveskite URL: `http://localhost:3000/api/webhooks/stripe` (lokaliam testavimui)
4. Pažymėkite šiuos įvykius:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
5. Paspauskite "Add endpoint"
6. Nukopijuokite **Signing secret** (prasideda `whsec_...`)

### Žingsnis 4: Pridėkite raktus į .env.local
1. Atidarykite `.env.local` failą projekto šakniniame kataloge
2. Pridėkite šias eilutes:

```env
STRIPE_SECRET_KEY=sk_test_... (įklijuokite savo raktą)
STRIPE_WEBHOOK_SECRET=whsec_... (įklijuokite webhook secret)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (įklijuokite publishable key)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 2️⃣ Resend Konfigūracija (3 minutės)

### Žingsnis 1: Sukurkite Resend paskyrą
1. Eikite į https://resend.com
2. Paspauskite "Sign up"
3. Užregistruokite paskyrą su savo el. paštu

### Žingsnis 2: Gaukite API raktą
1. Prisijunkite prie Resend
2. Eikite į **API Keys**
3. Paspauskite "Create API Key"
4. Įveskite pavadinimą (pvz., "Yakiwood Development")
5. Nukopijuokite API raktą (prasideda `re_...`)

### Žingsnis 3: Pridėkite raktą į .env.local
```env
RESEND_API_KEY=re_... (įklijuokite savo raktą)
```

**Pastaba tesavimui:** Naudodami nemokamą Resend planą, galite siųsti el. laiškus tik į savo registruotą el. pašto adresą.

---

## 3️⃣ Webhook testavimas lokaliai (5 minutės)

Kad webhook'ai veiktų jūsų kompiuteryje, reikia Stripe CLI:

### Įdiekite Stripe CLI

**Windows (su Scoop):**
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Arba atsisiųskite iš:** https://github.com/stripe/stripe-cli/releases

### Naudokite Stripe CLI

1. Atidarykite terminalą
2. Prisijunkite prie Stripe:
```bash
stripe login
```

3. Paleiskite webhook forwarding:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. Pamatysite webhook signing secret - nukopijuokite jį į `.env.local` kaip `STRIPE_WEBHOOK_SECRET`

5. Palikite šį terminalą veikti kol testuojate

---

## 4️⃣ Išbandykite mokėjimo procesą

### Paleiskite programą
```bash
npm run dev
```

### Testuokite:
1. Atidarykite http://localhost:3000
2. Eikite į produktus (pvz., `/produktai`)
3. Paspauskite produktą
4. Paspauskite "Add to Cart" (arba sukonfigūruokite 3D)
5. Atidarykite krepšelį (cart icon viršuje dešinėje)
6. Paspauskite "Proceed to Checkout"
7. Užpildykite formą:
   - El. paštas: jūsų@email.com
   - Vardas: Test User
   - Telefonas: +370 600 00000
   - Adresas: Test g. 123
   - Miestas: Vilnius
   - Pašto kodas: 12345
8. Paspauskite "Complete Order"
9. Būsite nukreipti į Stripe mokėjimo puslapį
10. Naudokite testinę kortelę:
    - **Kortelės numeris:** `4242 4242 4242 4242`
    - **Galiojimas:** Bet kokia ateities data (pvz., 12/25)
    - **CVV:** Bet kokie 3 skaičiai (pvz., 123)
    - **Pašto kodas:** Bet kokie 5 skaičiai (pvz., 12345)
11. Paspauskite "Pay"
12. Turėtumėte būti nukreipti į patvirtinimo puslapį
13. Patikrinkite el. paštą - turėtų būti sąskaita PDF formatu

### Stripe CLI terminale pamatysite:
```
✔ Received event: checkout.session.completed
```

### Stripe Dashboard:
- Eikite į https://dashboard.stripe.com/test/payments
- Pamatysite naują mokėjimą

---

## 5️⃣ Patikrinkite ar viskas veikia

### ✅ Turėtų veikti:
- [x] Krepšelis prideda produktus
- [x] Krepšelio sidebar rodo produktus ir kainas
- [x] Checkout puslapis priima duomenis
- [x] Stripe nukreipimas veikia
- [x] Mokėjimas pavyksta su test kortele
- [x] Order confirmation puslapis rodomas
- [x] Krepšelis išvalomas po užsakymo
- [x] El. laiškas su sąskaita gaunamas

### ❓ Problemos?

**Mokėjimas nepavyksta:**
- Patikrinkite ar `STRIPE_SECRET_KEY` prasideda `sk_test_`
- Naudokite testinę kortelę `4242 4242 4242 4242`

**Webhook negauna įvykių:**
- Patikrinkite ar `stripe listen` procesas veikia
- Patikrinkite ar `STRIPE_WEBHOOK_SECRET` teisingas

**El. laiškas negaunamas:**
- Patikrinkite ar `RESEND_API_KEY` prasideda `re_`
- Patikrinkite spam aplanką
- Nemokamas Resend planas siunčia tik į registruotą el. paštą

---

## 6️⃣ Gamybos (Production) paruošimas

Kai būsite pasiruošę realiai pradėti parduoti:

### 1. Perjunkite į Live režimą Stripe
1. Stripe Dashboard → toggle iš "Test" į "Live"
2. Eikite į Developers → API keys
3. Nukopijuokite **live** raktus (prasideda `sk_live_` ir `pk_live_`)
4. Pridėkite juos į `.env.local` arba Vercel environment variables

### 2. Sukonfigūruokite tikrą webhook
1. Stripe Dashboard (Live mode) → Developers → Webhooks
2. Add endpoint: `https://jusudomenas.lt/api/webhooks/stripe`
3. Pažymėkite tuos pačius įvykius
4. Nukopijuokite naują webhook secret

### 3. Patvirtinkite domeną Resend
1. Resend Dashboard → Domains
2. Add domain: `yakiwood.lt`
3. Pridėkite DNS įrašus (SPF, DKIM)
4. Laukite patvirtinimo (~10min)

### 4. Deploy į Vercel
1. Push kodą į GitHub
2. Importuokite projektą į Vercel
3. Pridėkite visus environment variables
4. Deploy!

---

## 📚 Daugiau informacijos

- **Pilnas setup vadovas:** žiūrėkite `SETUP_GUIDE.md`
- **Techninė dokumentacija:** žiūrėkite `CHECKOUT_IMPLEMENTATION.md`
- **Bendras progresas:** žiūrėkite `IMPLEMENTATION_STATUS.md`

---

## 🎉 Baigta!

Jūsų e-parduotuvė dabar turi:
- ✅ Veikiantį krepšelį
- ✅ Checkout procesą
- ✅ Stripe mokėjimus
- ✅ Automatinį sąskaitų generavimą
- ✅ El. pašto siuntimą

Liko tik:
- Pridėti tikrus produktų paveikslėlius
- Pridėti 3D modelius (jei norite)

**Sėkmės! 🚀**
