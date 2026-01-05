# Projekto apimties palyginimas (DONE / PARTIAL / TODO)

Data: 2026-01-05

Ši ataskaita palygina tavo pateiktą apimties sąrašą su tuo, kas realiai įgyvendinta repozitorijoje.

Legenda:
- **DONE** – įgyvendinta ir naudojama.
- **PARTIAL** – yra bazė arba dalis funkcionalumo, bet trūksta pilno reikalavimo.
- **TODO** – nėra įgyvendinta (arba tik placeholder / dokumentacija / asset’ai).

> Pastaba: procentai – apytikslis įgyvendinimo lygis *to konkretaus punkto*.

---

## 1) Dizaino adaptacija

### 1.1 Analizė ir adaptacija pagal kliento pasirinktus svetainių pavyzdžius
- Statusas: **PARTIAL (~40%)**
- Yra: suvestas dizaino pagrindas (fonts/colors/tokens), bet „adaptacija pagal pasirinktus pavyzdžius“ reikalauja tavo patvirtintų pavyzdžių ir UX peržiūros.
- Įrodymai: `tailwind.config.cjs`, `app/globals.css`

### 1.2 Spalvų paletės, šriftų, grafinių elementų derinimas
- Statusas: **DONE (~85%)**
- Yra: dizaino tokenai, font’ai per `next/font`, asset sistema.
- Įrodymai: `app/layout.tsx`, `tailwind.config.cjs`, `app/globals.css`, `lib/assets.ts`, `public/assets/`

### 1.3 Vizualinio stiliaus suderinimas su prekės ženklo identitetu
- Statusas: **PARTIAL (~50%)**
- Yra: techninė bazė ir vientisa estetika.
- Trūksta: formalaus brand guideline suderinimo (sprendimas – dizaino peržiūra / Figma patvirtinimas).

---

## 2) Svetainės mobilumo užtikrinimas

### 2.1 Dizaino adaptacija mobiliems telefonams ir planšetėms
- Statusas: **DONE (~80%)**
- Yra: responsyvus header, mobilus meniu, grid’ai su `sm/md/lg`.
- Įrodymai: `components/shared/Header.tsx`, `components/shared/MobileMenu.tsx`, `app/products/page.tsx`

### 2.2 Testavimas įvairiose platformose ir naršyklėse
- Statusas: **PARTIAL (~40%)**
- Yra: Playwright e2e infrastruktūra (`npm run test:e2e`).
- Trūksta: atlikto testavimo protokolo (Chrome/Firefox/WebKit), realių device’ų patikros ir bug-fix backlog.
- Įrodymai: `package.json`, `playwright.config.ts`, `e2e/`

---

## 3) Puslapių struktūros kūrimas

### 3.1 Meniu, antraščių ir kitų puslapio elementų organizavimas
- Statusas: **DONE (~80%)**
- Įrodymai: `components/shared/Header.tsx`, `components/shared/PageLayout.tsx`

### 3.2 Svetainės navigacijos kūrimas ir optimizavimas
- Statusas: **DONE (~75%)**
- Yra: LT/EN route mapping, sticky header, mobile menu.
- Įrodymai: `components/shared/Header.tsx`, `components/LanguageSwitcher.tsx`

### 3.3 Interaktyvių elementų kūrimas
- Statusas: **DONE (~75%)**
- Yra: modals (login/register/forgot), cart sidebar, filtrai.
- Įrodymai: `components/modals/*`, `components/shared/CartSidebar.tsx`, `app/products/page.tsx`

### 3.4 Puslapio programavimo darbai
- Statusas: **DONE (~80%)**
- Yra: App Router puslapiai, API route’ai, komponentų struktūra.
- Įrodymai: `app/**`

---

## 4) Elektroninės komercijos modulio integracija

### 4.1 Pardavimų procesų įdiegimas, automatizavimas ir optimizavimas
- Statusas: **PARTIAL (~70%)**
- Yra: Stripe Checkout + webhook (order + invoice + email).
- Trūksta: pilnas price mapping (Stripe Price ID), produkciniai env, edge-case event’ai (refund/failed/dispute) pagal poreikį.
- Įrodymai: `app/checkout/page.tsx`, `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`

### 4.2 Automatinis prekių atsargų valdymas
- Statusas: **PARTIAL (~60%)**
- Yra: admin inventoriaus UI + `/api/inventory/*` ir `InventoryManager` logika.
- Rizika / trūkumas: aktyvus Stripe webhook srautas yra `app/api/webhooks/stripe/route.ts`, o inventory rezervavimo logika matosi kitame webhook route (`app/api/webhook/route.ts`). Reikia suvienodinti, kad realūs apmokėjimai nuimtų/rezervuotų stock.
- Įrodymai: `app/admin/inventory/page.tsx`, `app/api/inventory/*`, `app/api/webhook/route.ts`, `app/api/webhooks/stripe/route.ts`

### 4.4 Prekių krepšelio ir užsakymo puslapių kūrimas
- Statusas: **DONE (~80%)**
- Yra: krepšelis per Zustand + checkout UI.
- Įrodymai: `lib/cart/store.ts`, `app/checkout/page.tsx`

---

## 5) Parduotuvės filtrų konfigūracija

### 5.1 Paieškos rezultatų kūrimas ir programavimas
- Statusas: **PARTIAL (~30%)**
- Yra: paieška/filtrai admin inventoriuje.
- Trūksta: pilna produktų paieška (front) pagal tekstą + rezultatų puslapis.
- Įrodymai: `app/admin/inventory/page.tsx`

### 5.2 Prekių filtravimas pagal kategorijas, kainas, prekės ženklus ir kt.
- Statusas: **PARTIAL (~50%)**
- Yra: filtrai pagal usage ir woodType produktų sąraše.
- Trūksta: kainos intervalas, brand’ai ir kiti parametrai (jei reikalingi).
- Įrodymai: `app/products/page.tsx`

---

## 6) Mokėjimų būdų integracija

### 6.1 PayPal, Paysera, Stripe ir kitų mokėjimo šaltinių integravimas
- Statusas: **PARTIAL (~35%)**
- Yra: Stripe.
- TODO: PayPal/Paysera reali integracija (šiuo metu yra tik asset/logotipas ir paminėjimai).
- Įrodymai: Stripe – `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`; PayPal – `public/assets/payments/paypal.svg` (tik asset)

### 6.2 Automatiniai mokėjimo patvirtinimai ir ataskaitos
- Statusas: **PARTIAL (~60%)**
- Yra: Stripe webhook patvirtinimas ir order/invoice generavimas.
- Trūksta: ataskaitos (admin UI) ir papildomi event’ai pagal poreikį.
- Įrodymai: `app/api/webhooks/stripe/route.ts`

---

## 7) Integracijos su išorinėmis sistemomis

### 7.1 El. pašto rinkodaros įrankių integracija
- Statusas: **DONE (~75%)**
- Yra: newsletter provider’iai (Mailchimp / Resend / Supabase DB).
- Įrodymai: `lib/newsletter/providers.ts`, `docs/NEWSLETTER*.md`

### 7.2 Socialinių tinklų ir trečiųjų šalių platformų integracija
- Statusas: **PARTIAL (~50%)**
- Yra: share funkcijos + social link’ai.
- Trūksta: realūs profilių URL (dabar yra placeholder’ai), jei reikia – Pixel/Conversions API.
- Įrodymai: `components/products/ProductDetailClient.tsx`, `components/shared/Footer.tsx`, `components/shared/MobileMenu.tsx`

---

## 8) Daugiakalbiškumas

### 8.1 Daugiakalbiškumo modulio programavimas
- Statusas: **DONE (~70%)**
- Yra: next-intl `lt` + `en`, locale cookie.
- Pastaba: `html lang` dabar fiksuotas `lt` (jei norite pilno EN, reikia padaryti dinamiškai).
- Įrodymai: `i18n/request.ts`, `next-intl.config.ts`, `app/layout.tsx`

### 8.2 Kalbos perjungimo mygtuko integracija
- Statusas: **DONE (~80%)**
- Yra: LanguageSwitcher su route mapping.
- Įrodymai: `components/LanguageSwitcher.tsx`, `components/shared/Header.tsx`

---

## 9) Turinio valdymo sistemos integracija (CMS)

### 9.1 Turinio redaktoriaus integracija
- Statusas: **DONE (~75%)**
- Yra: Sanity Studio `/studio`.
- Įrodymai: `app/studio/[[...tool]]/*`, `sanity.config.ts`

### 9.2 Vartotojo teisių ir prieigos valdymas
- Statusas: **PARTIAL (~40%)**
- Yra: Sanity token support server-side.
- Trūksta: aiškiai aprašytas roles modelis (dažniausiai sprendžiama per Sanity role nustatymus ir Vercel env).
- Įrodymai: `sanity/lib/client.ts`

### 9.3 Skirtingų turinio tipų valdymo galimybės
- Statusas: **PARTIAL (~60%)**
- Yra: `product`, `project`, blog (post/category/author).
- Trūksta: pilnesnis `project` schema (dabar minimalus: title+slug).
- Įrodymai: `sanity/schemaTypes/productType.ts`, `sanity/schemaTypes/projectType.ts`, `sanity/schemaTypes/index.ts`

---

## 10) Vidinis SEO / Performance

### 10.1 Raktinių žodžių integracija į turinį, meta žymes ir URL
- Statusas: **PARTIAL (~60%)**
- Yra: metadata sistema, title/description, OG/Twitter.
- Trūksta: turinio (tekstų) SEO peržiūros pagal raktinius žodžius.
- Įrodymai: `app/layout.tsx`, `lib/metadata.ts`, atskirų puslapių `generateMetadata`.

### 10.2 Nuotraukų optimizacija SEO
- Statusas: **PARTIAL (~60%)**
- Yra: Next Image, `deviceSizes/formats`, cache headers.
- Trūksta: content image audit (alt tekstai visur, realūs image dydžiai, LCP optimizacija).
- Įrodymai: `next.config.ts`, komponentai su `next/image`.

### 10.3 Serverio nustatymai siekiant maksimalaus greičio
- Statusas: **DONE (~70%)**
- Yra: cache headers, basic security headers.
- Įrodymai: `next.config.ts`

### 10.4 Struktūrizuoti duomenys (Rich Snippets)
- Statusas: **PARTIAL (~60%)**
- Yra: Organization JSON-LD.
- Trūksta: nuoseklus Product/FAQ/Article schema naudojimas visuose atitinkamuose puslapiuose (jei tai reikalavimas).
- Įrodymai: `app/layout.tsx`, `lib/schema.ts`

### 10.5 Sitemap / Robots
- Statusas: **DONE (~80%)**
- Įrodymai: `app/sitemap.ts`, `app/robots.ts`

---

## 11) Saugumas / SSL / Backups

### 11.1 Saugumo priemonių integravimas
- Statusas: **DONE (~75%)**
- Yra: CSP, HSTS, referrer policy, permissions policy.
- Įrodymai: `next.config.ts`

### 11.2 SSL sertifikato integracija
- Statusas: **PARTIAL (~50%)**
- Pastaba: realiai sprendžia hostingas (Vercel/Cloudflare). Kode yra HSTS.

### 11.3 Atsarginių kopijų kūrimas ir atkūrimo modulio integracija
- Statusas: **TODO (~0–20%)**
- Yra: dokumentacija ir atskirų servisų (Sanity/Supabase) galimybės, bet nėra integruoto „backup/restore modulio“ aplikacijos lygyje.

---

## Kritiniai neatitikimai / rizikos (rekomenduojama sutvarkyti)

1) **Atsargų valdymas vs Stripe webhook**
- Dabar yra du webhook keliai: `app/api/webhooks/stripe/route.ts` (aktyvus Stripe srautas) ir `app/api/webhook/route.ts` (matosi inventory rezervavimo/confirm/release logika).
- Reikia nuspręsti, kuris yra „source of truth“ ir sujungti inventory atnaujinimą į realų Stripe webhook srautą.

2) **PayPal/Paysera integracija**
- Šiuo metu **nėra** realių integracijų, tik asset/logotipai ir paminėjimai.

3) **Produkciniai env ir E2E testas**
- Reikia suvesti Stripe + email (SMTP arba Resend) ir praeiti test payment → webhook → invoice → email.

---

## Siūlomas sekantis žingsnis (jei siekiama „100% pagal sąrašą“)

1) Nuspręsti dėl mokėjimų: ar reikia Paysera/PayPal, ar paliekam tik Stripe.
2) Sulyginti atsargų valdymą su Stripe webhook (vienas srautas).
3) Susitarti dėl filtrų apimties (kaina/brand/kiti) ir įgyvendinti.
4) Atlikti cross-browser testą ir surinkti bug list.
