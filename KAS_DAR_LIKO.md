# Kas dar liko iki 100% užbaigimo

**Dabartinis progresas: 85%**  
**Liko padaryti: 15%**

---

## 🔴 KRITINIAI (be šių neveiks pardavimas)

### 1. Environment Variables (2 min)
**Procentai: 5%**

```env
# Reikia pridėti į .env.local:
STRIPE_SECRET_KEY=sk_test_...           # Stripe mokėjimams
STRIPE_WEBHOOK_SECRET=whsec_...         # Webhook verifikacijai
RESEND_API_KEY=re_...                   # El. pašto siuntimui
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Kaip gauti:**
- Stripe: https://dashboard.stripe.com/test/apikeys
- Resend: https://resend.com/api-keys
- Instrukcijos: `GREITAS_STARTAS.md`

---

### 2. Webhook Testavimas (10 min)
**Procentai: 3%**

```bash
# Įdiegti Stripe CLI ir paleisti:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Kas testuotina:**
- ✅ Mokėjimo apdorojimas
- ✅ Užsakymo sukūrimas duomenų bazėje
- ✅ Sąskaitos PDF generavimas
- ✅ El. laiško išsiuntimas

**Instrukcijos:** `SETUP_GUIDE.md` skyrius 1.4

---

### 3. Supabase Duomenų Bazė (15 min)
**Procentai: 5%**

**Reikia:**
1. Sukurti Supabase projektą: https://supabase.com
2. Nukopijuoti credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```
3. Paleisti migrations:
```bash
npm run supabase:push
```
4. Atkomentuoti middleware: `middleware.ts` eilutė su `updateSession()`

**Kas neveikia be šito:**
- Užsakymų saugojimas
- Invoice'ų saugojimas
- Vartotojų paskyros
- Admin panel duomenys

---

## 🟡 SVARBŪS (reikia prieš produktą paleidimą)

### 4. Produktų Turinys (2-4 val)
**Procentai: 10%**

**Reikia:**
- [ ] Tikri produktų paveikslėliai (ne placeholder)
- [ ] Produktų aprašymai lietuvių k.
- [ ] Produktų kainos
- [ ] Produktų variantai (spalvos, apdailos)
- [ ] 3D modeliai GLTF formatu (opcionalu)

**Kaip pridėti:**
1. Per Sanity CMS: http://localhost:3000/studio
2. Arba per Figma MCP: eksportuoti ir importuoti
3. Arba rankiniu būdu į `/public/assets/products/`

**Kas dabar:**
- ✅ Produktų struktūra Sanity
- ✅ ProductDetail komponentas
- ❌ Tikri produktų duomenys

---

### 5. E2E Testai (3-4 val)
**Procentai: 8%**

**Kas jau yra:**
- ✅ Playwright konfigūracija
- ✅ Smoke testai (routes)
- ✅ Homepage testai

**Kas reikia:**
- [ ] Checkout flow testas (cart → checkout → payment → confirmation)
- [ ] Payment failure testas
- [ ] Email delivery testas
- [ ] Cart persistence testas
- [ ] Mobile checkout testas

**Paleisti:**
```bash
npm run test:e2e
```

**Failai kurti:** `e2e/checkout-flow.spec.ts`

---

### 6. Production Deployment (1 val)
**Procentai: 5%**

**Žingsniai:**
1. Push į GitHub
2. Importuoti į Vercel: https://vercel.com
3. Pridėti environment variables (PRODUCTION raktus)
4. Deploy
5. Sukonfigūruoti custom domain: yakiwood.lt
6. Stripe live raktai vietoj test
7. Resend domain verification
8. Production webhook URL

**Dokumentacija:** `SETUP_GUIDE.md` skyrius 4

---

## 🟢 GERAI BŪTŲ TURĖTI (pagerinimas)

### 7. SEO Optimizacija (2 val)
**Procentai: 3%**

**Reikia:**
- [ ] Meta tags visiems puslapiams
- [ ] Open Graph images
- [ ] Structured data (JSON-LD)
- [ ] Sitemap.xml (jau yra, bet patikrinti)
- [ ] Robots.txt (jau yra)
- [ ] Lithuanian hreflang tags

**Failai:** `app/**/metadata.ts` kiekviename route

---

### 8. Mobile Optimizacija (3 val)
**Procentai: 4%**

**Kas reikia patobulinti:**
- [ ] 3D configurator touch gestures
- [ ] Mobile checkout keyboard handling
- [ ] Sticky header mobile scroll
- [ ] Cart sidebar swipe to close
- [ ] Product gallery swipe

**Testavimas:** Chrome DevTools + real devices

---

### 9. Performance (2 val)
**Procentai: 3%**

**Optimizacijos:**
- [ ] Image optimization (next/image visur)
- [ ] Code splitting patikrinimas
- [ ] Bundle size analizė
- [ ] Core Web Vitals audit
- [ ] Lazy loading 3D modelių

**Įrankiai:**
```bash
npm run audit:performance
ANALYZE=true npm run build
```

---

### 10. Security (2 val)
**Procentai: 3%**

**Pridėti:**
- [ ] Rate limiting (checkout, API routes)
- [ ] CAPTCHA registration form
- [ ] Input sanitization
- [ ] SQL injection protection (Supabase RLS jau yra)
- [ ] CORS headers review

**Failai:** `middleware.ts`, `next.config.ts`

---

### 11. Newsletter Sistema (1 val)
**Procentai: 2%**

**Kas yra:**
- ✅ Providers (Mailchimp, Resend, Database)
- ✅ Subscribe API
- ✅ Admin panel UI
- ✅ Unsubscribe flow

**Kas reikia:**
- [ ] Mailchimp API key (jei naudosite)
- [ ] Email template design
- [ ] Testavimas

**Konfigūracija:** `.env.local` + `NEWSLETTER_QUICKSTART.md`

---

### 12. Customer Features (4 val)
**Procentai: 5%**

**Opcionalu bet naudinga:**
- [ ] Order tracking page
- [ ] Customer account page (order history)
- [ ] Saved addresses
- [ ] Wishlist funkcionalumas
- [ ] Product reviews/ratings
- [ ] Recently viewed products

**Statusas:** Bazinės struktūros yra, reikia UI

---

### 13. Analytics & Monitoring (2 val)
**Procentai: 3%**

**Integruoti:**
- [ ] Google Analytics (jau config yra, reikia ID)
- [ ] Sentry error tracking
- [ ] LogRocket session replay
- [ ] Conversion tracking (FB Pixel, Google Ads)
- [ ] Stripe Dashboard monitoring

**Failai:** 
- `components/GoogleAnalytics.tsx` (jau yra)
- `.env.local` pridėti IDs

---

### 14. Admin Features (3 val)
**Procentai: 4%**

**Kas veikia:**
- ✅ Products CRUD
- ✅ Orders view
- ✅ Invoices view
- ✅ Newsletter subscribers

**Kas pagerintų:**
- [ ] Dashboard su statistika
- [ ] Order status workflow
- [ ] Bulk operations
- [ ] Reports/exports
- [ ] Inventory alerts

**Failai:** `app/admin/**/*`

---

### 15. Email Templates (2 val)
**Procentai: 2%**

**Dabartinis:**
- ✅ Plain text/HTML hybrid
- ✅ Invoice attachment

**Pagerinimas:**
- [ ] React Email templates (https://react.email)
- [ ] Brand styling
- [ ] Mobile responsive
- [ ] Lithuanian translations
- [ ] Order confirmation variations

**Failas:** Sukurti `emails/` directory

---

## 📊 Procentų Paskirstymas

```
KRITINIAI (13%):
  ✅ Environment Variables: 5%
  ✅ Webhook Testing: 3%
  ✅ Supabase Setup: 5%

SVARBŪS (23%):
  ⚠️ Produktų turinys: 10%
  ⚠️ E2E testai: 8%
  ⚠️ Production deploy: 5%

GERAI TURĖTI (49%):
  🟢 SEO: 3%
  🟢 Mobile: 4%
  🟢 Performance: 3%
  🟢 Security: 3%
  🟢 Newsletter: 2%
  🟢 Customer features: 5%
  🟢 Analytics: 3%
  🟢 Admin features: 4%
  🟢 Email templates: 2%

JŪ PADARĖTE ŠIANDIEN: 15%
DABARTINIS: 85%
LIKO: 15%
```

---

## 🎯 Prioritetų Tvarka

### Šią savaitę (85% → 90%):
1. ✅ Pridėti environment variables (5 min)
2. ✅ Išbandyti Stripe checkout (15 min)
3. ✅ Sukonfigūruoti Supabase (20 min)

**Total: 40 min → 90% progress**

---

### Kitą savaitę (90% → 95%):
4. Pridėti produktų turinį Sanity (2-4 val)
5. Parašyti E2E testus checkout flow (3 val)
6. Deploy į Vercel (1 val)

**Total: 6-8 val → 95% progress**

---

### Po to (95% → 100%):
7. SEO optimizacija (2 val)
8. Mobile patobulinimai (3 val)
9. Performance audit (2 val)
10. Security features (2 val)
11. Newsletter setup (1 val)
12. Analytics integration (2 val)

**Total: 12 val → 100% progress**

---

## 🏁 Minimalus Produktas (MVP)

Jei norite greičiausiai paleisti produkciją:

### Būtina (90%):
- ✅ Environment variables
- ✅ Stripe test
- ✅ Supabase setup
- ✅ Bent 3-5 produktai su paveikslėliais
- ✅ Deploy į Vercel

### Galima vėliau:
- ⏳ Pilnas SEO
- ⏳ E2E testai
- ⏳ Analytics
- ⏳ Customer accounts
- ⏳ Newsletter
- ⏳ Reviews

---

## 💡 Mano Rekomendacija

**Šiandien (30 min):**
1. Pridėkite Stripe test raktus
2. Pridėkite Resend API raktą
3. Paleiskite `stripe listen`
4. Išbandykite checkout su test kortele
5. Patikrinkite ar gaunate email

**Rytoj (2-3 val):**
6. Sukurkite Supabase projektą
7. Pridėkite credentials
8. Paleisite migrations
9. Atkomentuokite middleware

**Savaitgalį (4-6 val):**
10. Pridėkite bent 5 produktus per Sanity
11. Deploy į Vercel
12. Pasidalinkite su draugais testuoti

**Po savaitės:**
- Jau turėsite veikiančią e-parduotuvę! 🎉
- Vėliau galėsite tobulinti SEO, testus, features

---

## ❓ FAQ

**Q: Kiek laiko užtruks viskas iki 100%?**  
A: 
- Kritiniai dalykai: 40 min
- MVP paleisti: 8-10 val (per savaitę)
- Viskas 100%: 20-30 val (per mėnesį)

**Q: Ar galiu paleisti be Supabase?**  
A: Ne, užsakymai saugomi Supabase. Bet setup užtrunka tik 15 min.

**Q: Ar galiu pradėti pardavinėti be E2E testų?**  
A: Taip, bet rekomenduoju bent rankiniu būdu išbandyti checkout flow kelis kartus.

**Q: Kiek kainuos?**  
A:
- Stripe: 1.5% + €0.25 per transakciją
- Resend: Nemokamai iki 100 email/dieną
- Supabase: Nemokamai iki 500MB
- Vercel: Nemokamai (Hobby plan)

**Q: Kas svarbiausia dabar?**  
A: **Environment variables + Stripe test!** Visa kita gali palaukti.

---

**Atnaujinta:** 2024-12-29  
**Dabartinis progresas:** 85%  
**Artimiausias milestone:** 90% (šią savaitę)  
**Galutinis tikslas:** 100% (per mėnesį)
