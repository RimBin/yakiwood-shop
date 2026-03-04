# Yakiwood projekto atitikties auditas pagal numatomus darbus

Data: 2026-03-03  
Repo: `yakiwood-website` (Next.js App Router)

HTML versija (patogiam lentelių peržiūrėjimui naršyklėje): [docs/YAKIWOOD_AUDIT_SCOPE_MATRIX_2026-03-03.html](YAKIWOOD_AUDIT_SCOPE_MATRIX_2026-03-03.html)

## Kaip vertinta

Šis auditas tikrina **repo artefaktus** (kodas, maršrutai, konfigūracija, dokumentacija) prieš pateiktą darbų apimtį.

- **Įgyvendinta** – funkcionalumas/artefaktas yra repozitorijoje ir logiškai uždengia reikalavimą.
- **Dalinai** – dalis yra (pvz., UI be serverinės persistencijos, arba veikia tik su vienu mokėjimo provideriu).
- **Nėra** – repozitorijoje nerasta.

Pastabos:
- “Valandų plausibility” yra **heuristika** (be timesheet negalima patvirtinti tikslių valandų).
- Kai kurie punktai yra **infra atsakomybė** (SSL sertifikatas) – repozitorija gali tik parodyti pasiruošimą (HSTS, CSP) ir dokumentaciją.

---

## Sužymėjimas pagal įvykdymo statusą (greita santrauka)

### A) E. pardavimo sandorio sprendimas

**Pilnai įgyvendinta (6/11):**
- 1) Dizaino adaptacija
- 3) Puslapių struktūros kūrimas
- 5) Parduotuvės filtrų konfigūracija
- 6) Mokėjimų būdų integracija
- 8) Daugiakalbiškumas (LT + EN)
- 10) Vidinis SEO

**Dalinai įgyvendinta (5/11):**
- 2) Mobilumas: UI yra, bet trūksta testavimo ataskaitų/protokolų kaip įrodymo
- 4) E‑commerce modulis: branduolys yra, bet inventorius/mokėjimų provider’ių srautai ne visur suvienodinti
- 7) Išorinės integracijos: newsletter yra, kitos 3rd‑party priklauso nuo poreikių
- 9) CMS: yra admin UI, bet serverinė persistencija/workflow nėra pilnai patvirtinti
- 11) Saugumas: security headers + backup planas yra, SSL provisioning yra hosting’o dalis

**Nėra (0/11):**
- Nerasta punktų, kurie repo lygiu būtų visiškai neįgyvendinti (visi turi bent dalinį padengimą).

### B) Vaizdinės konfigūracijos sprendimas

**Pilnai įgyvendinta (1/3):**
- 2) Produktų vizualizacija (real‑time savybių keitimas)

**Dalinai įgyvendinta (2/3):**
- 1) Produkto modeliavimas: modeliai/pipeline yra, bet “eksportas į skirtingus formatus” labiau procesas nei aplikacijos modulis
- 3) Duomenų sujungimas: užsakymų sistema yra, bet dalis darbo yra duomenų/asset’ų užpildymas (ne vien kodas)

**Nėra (0/3):**
- Nerasta punktų, kurie repo lygiu būtų visiškai neįgyvendinti (visi turi bent dalinį padengimą).

---

## A) Yakiwood įmonės e. pardavimo sandorio sprendimas – atitiktis

| Nr. | Darbas (santrauka) | Val. kiekis (C) | Įkainis (EUR/val be PVM) (B) | Suma (C×B) be PVM (D) | Statusas | Repo įrodymai | Pastabos / spragos |
|---:|---|---:|---:|---:|---|---|---|
| 1 | Dizaino adaptacija (analizė + adaptacija, spalvos/šriftai/grafika, brand suderinimas) | 120 | 50 | 6000 | Įgyvendinta (repo lygiu) | [app/layout.tsx](app/layout.tsx), [app/globals.css](app/globals.css), [components/PageLayout.tsx](components/PageLayout.tsx) | Reali “adaptacija pagal kliento pasirinktus pavyzdžius” reikalauja dizaino peržiūros/acceptance už repo ribų. |
| 2 | Svetainės mobilumo užtikrinimas (mobile/tablet adaptacija + cross‑browser testai) | 110 | 50 | 5500 | Įgyvendinta (UI) / Dalinai (testavimo įrodymai) | [components/shared/MobileMenu.tsx](components/shared/MobileMenu.tsx), [components/products/ProductsPageClient.tsx](components/products/ProductsPageClient.tsx), [e2e/smoke.spec.ts](e2e/smoke.spec.ts) | Cross‑browser/device matrica (Safari/iOS realūs įrodymai) repo viduje nėra pilnai dokumentuota (reikėtų test protokolo/ataskaitų). |
| 3 | Puslapių struktūros kūrimas (menu, navigacija, interaktyvumas, programavimo darbai) | 120 | 50 | 6000 | Įgyvendinta | [app/layout.tsx](app/layout.tsx), [components/shared/Footer.tsx](components/shared/Footer.tsx), [components/HomeComposite.tsx](components/HomeComposite.tsx) | Interaktyvumo apimtis priklauso nuo to, ką laikai “interaktyviais elementais” (pvz., filtrai, konfigūratorius – tie yra). |
| 4 | Elektroninės komercijos modulio integracija (pardavimų procesai, atsargos, krepšelis + užsakymas) | 140 | 50 | 7000 | Įgyvendinta | [lib/cart/store.ts](lib/cart/store.ts), [app/checkout/page.tsx](app/checkout/page.tsx), [app/api/orders/create/route.ts](app/api/orders/create/route.ts), [app/api/checkout/route.ts](app/api/checkout/route.ts) | Inventoriaus finalizacija suvienodinta per bendrą helper’į; checkout UI šiuo metu Paysera‑only. |
| 4.1 | Pardavimų procesų įdiegimas/automatizavimas/optimizavimas (įtraukta į 4) | – | – | – | Įgyvendinta (order‑first + webhooks) | [app/api/pricing/lock/route.ts](app/api/pricing/lock/route.ts), [app/api/orders/create/route.ts](app/api/orders/create/route.ts), [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) | Stripe webhook suvienodintas per bendrą handlerį [lib/stripe/webhook.ts](lib/stripe/webhook.ts); [app/api/webhook/route.ts](app/api/webhook/route.ts) paliktas kaip legacy alias. |
| 4.2 | Automatinis prekių atsargų valdymas (įtraukta į 4) | – | – | – | Įgyvendinta (branduolys) | [lib/inventory/manager.ts](lib/inventory/manager.ts), [lib/inventory/finalize-paid-order.ts](lib/inventory/finalize-paid-order.ts), [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts), [app/api/webhooks/paysera/route.ts](app/api/webhooks/paysera/route.ts), [app/api/paypal/capture/route.ts](app/api/paypal/capture/route.ts) | `reserveStock` + `confirmSale` vykdomi po sėkmingo apmokėjimo visuose provider’ių srautuose (best‑effort). |
| 4.4 | Prekių krepšelio ir užsakymo puslapių kūrimas (įtraukta į 4) | – | – | – | Įgyvendinta | [lib/cart/store.ts](lib/cart/store.ts), [app/checkout/page.tsx](app/checkout/page.tsx), [app/order-confirmation/page.tsx](app/order-confirmation/page.tsx) | Checkout UX dalis priklauso nuo dizaino/teksto patvirtinimo. |
| 5 | Parduotuvės filtrų konfigūracija (paieška + filtrai) | 35 | 50 | 1750 | Įgyvendinta | [components/products/ProductsPageClient.tsx](components/products/ProductsPageClient.tsx), [app/products/page.tsx](app/products/page.tsx) | Jei reikalinga server‑side faceted paieška dideliems katalogams – to čia greičiausiai nėra. |
| 6 | Mokėjimų būdų integracija (Paysera/Stripe/PayPal + patvirtinimai/ataskaitos) | 70 | 50 | 3500 | Įgyvendinta (Paysera) / Optional (kiti) | [app/api/paysera/init/route.ts](app/api/paysera/init/route.ts), [app/api/webhooks/paysera/route.ts](app/api/webhooks/paysera/route.ts), [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts), [app/api/paypal/capture/route.ts](app/api/paypal/capture/route.ts) | Šiuo metu checkout srautas nukreiptas į Paysera; Stripe/PayPal endpoint’ai gali būti laikomi išjungti / „vėliau“. |
| 7 | Integracijos su išorinėmis sistemomis (email marketing, social, 3rd party) | 100 | 50 | 5000 | Įgyvendinta (newsletter) / Dalinai (kitos 3rd party) | [lib/newsletter/providers.ts](lib/newsletter/providers.ts), [app/api/newsletter/route.ts](app/api/newsletter/route.ts), [components/GoogleAnalytics.tsx](components/GoogleAnalytics.tsx), [app/layout.tsx](app/layout.tsx) | Social integracijos daugiausia yra “nuorodos + schema.org sameAs”; “deep” integracijoms reikėtų tikslinti. |
| 8 | Daugiakalbiškumas (modulis + kalbos perjungimas) – LT + EN | 75 | 50 | 3750 | Įgyvendinta | [i18n/routing.ts](i18n/routing.ts), [i18n/paths.ts](i18n/paths.ts), [components/LanguageSwitcher.tsx](components/LanguageSwitcher.tsx), [messages/en.json](messages/en.json), [messages/lt.json](messages/lt.json) | Canonical default locale yra EN be prefikso, LT su `/lt` (tai svarbu SEO/URL strategijai). |
| 9 | Turinio valdymo sistemos integracija (redaktorius, teisės, turinio tipai) | 110 | 50 | 5500 | Dalinai | [app/admin/posts/page.tsx](app/admin/posts/page.tsx), [components/admin/PostsAdminClient.tsx](components/admin/PostsAdminClient.tsx), [app/admin/projects/page.tsx](app/admin/projects/page.tsx), [components/admin/ProjectsAdminClient.tsx](components/admin/ProjectsAdminClient.tsx) | Supabase projekte yra (pvz., produktų/užsakymų/inventoriaus dalyse; projektų nuotraukų įkėlimas į Supabase Storage), bet šiame admin turinio modulyje **straipsnių turinys** saugomas naršyklėje (`localStorage`), o **projektų įrašai** – naršyklėje (`IndexedDB`, su legacy migracija iš `localStorage`), t. y. ne centralizuotas DB CMS su workflow. (SEO yra atskiras punktas – žr. Nr. 10.) |
| 10 | Vidinis SEO (meta/URL, image SEO, greitis, schema.org / rich snippets) | 50 | 50 | 2500 | Įgyvendinta | [app/sitemap.ts](app/sitemap.ts), [app/robots.ts](app/robots.ts), [lib/seo/structured-data.ts](lib/seo/structured-data.ts), [app/products/[slug]/page.tsx](app/products/[slug]/page.tsx) | Raktinių žodžių integracija į turinį priklauso nuo realaus content (ne vien kodo). |
| 11 | Saugumo priemonės (SSL, backup/restore) | 50 | 50 | 2500 | Įgyvendinta (headers + backup planas) / Dalinai (SSL provisioning) | [next.config.ts](next.config.ts), [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | SSL sertifikatas paprastai yra hosting’o (Vercel) konfigūracija; repo rodo HSTS/CSP. Backup yra dokumentuotas, bet nėra automatizacijos repo viduje (pagal pasirinktą kriterijų – tai OK). |

**Suma iš viso (be PVM): 49 750 EUR**  
**Suma iš viso (su PVM 21%): 60 197,50 EUR**

---

## B) Yakiwood įmonės vaizdinės konfigūracijos sprendimas – atitiktis

| Nr. | Darbas (santrauka) | Val. kiekis (C) | Įkainis (EUR/val be PVM) (B) | Suma (C×B) be PVM (D) | Statusas | Repo įrodymai | Pastabos / spragos |
|---:|---|---:|---:|---:|---|---|---|
| 1 | Produkto modeliavimas (3D vizualizacija, detalus modeliavimas, eksportas į formatus) | 130 | 50 | 6500 | Įgyvendinta (modeliai + pipeline) / Dalinai (eksporto modulis) | [public/models/configurator/model.glb](public/models/configurator/model.glb), [public/models/products/README.md](public/models/products/README.md), [lib/models.ts](lib/models.ts) | “Eksportas į skirtingus formatus” repo lygiu labiau atrodo kaip **procesas (Blender → GLB)**, o ne aplikacijos modulis (GLB→STL/OBJ ir pan.). |
| 2 | Produktų vizualizacija (real‑time savybių keitimas: spalvos/tekstūros/parametrai) | 460 | 50 | 23000 | Įgyvendinta | [components/Konfiguratorius3D.tsx](components/Konfiguratorius3D.tsx), [components/configurator/ConfiguratorPage.tsx](components/configurator/ConfiguratorPage.tsx), [app/api/pricing/quote/route.ts](app/api/pricing/quote/route.ts) | Reali “tekstūrų” kaita yra (procedūrinės tekstūros + medžiagų parametrai). Fotorealistiniai PBR asset’ai būtų atskiras darbas. |
| 3 | Duomenų sujungimas su sistemomis (savybių/specifikacijų keitimas, tekstas+vaizdas prekėms, užsakymų valdymas) | 405 | 50 | 20250 | Dalinai–Įgyvendinta (užsakymų sistema yra) | [app/api/orders/create/route.ts](app/api/orders/create/route.ts), [app/admin/orders/page.tsx](app/admin/orders/page.tsx), [app/api/pricing/lock/route.ts](app/api/pricing/lock/route.ts), [lib/products.supabase.ts](lib/products.supabase.ts) | “Tekstinio ir vaizdinio turinio paruošimas kiekvienai prekei” nėra pilnai patvirtinama vien kodu; dalis yra asset’inė/duomenų užpildymo veikla. |

**Suma iš viso (be PVM): 49 750 EUR**  
**Suma iš viso (su PVM 21%): 60 197,50 EUR**

---

## GAP sąrašas (kas labiausiai gali būti laikoma „nepilnai“)

1) Inventoriaus automatizavimas suvienodintas (Stripe/Paysera/PayPal) per bendrą helper’į.  
2) CMS (turinio redaktorius) serverinė persistencija: Supabase projekte yra (pvz., produktai/užsakymai/inventorius; projektų nuotraukų įkėlimas į Supabase Storage), bet **būtent straipsnių turinys** iš `PostsAdminClient` saugomas `localStorage`, o **projektų įrašai** iš `ProjectsAdminClient` – `IndexedDB` (su legacy migracija iš `localStorage`). Jei reikia „tikro CMS“ šiai daliai, reikia DB modelio + API + rolių/publikavimo workflow.  
3) Stripe webhook suvienodintas: canonical [app/api/webhooks/stripe/route.ts](app/api/webhooks/stripe/route.ts) + legacy alias [app/api/webhook/route.ts](app/api/webhook/route.ts), bendra logika [lib/stripe/webhook.ts](lib/stripe/webhook.ts).  
4) Cross‑browser testavimo įrodymai: E2E yra, bet “testavimo ataskaitos” (platformų sąrašas, rezultatai) – labiau procesinis artefaktas.  
5) “Eksportas į skirtingus formatus” 3D dalyje: yra GLB pipeline, bet ne aplikacijos eksporto modulis.

---

## Santrauka (agentūros tikrintojo išvada)

- E‑komercijos branduolys (krepšelis → užsakymas → mokėjimas → patvirtinimas → invoice/email) repo lygiu atrodo **įgyvendintas** ir net “enterprise‑style” (webhook idempotency, amount validation, invoice PDF).  
- Daugiakalbiškumas LT+EN yra **realus** (messages, routing, switcher), su aiškia URL/SEO strategija (EN canonical, LT su `/lt`).  
- Didžiausia rizika “atitikties” prasme: **CMS interpretacija** (naršyklės redaktorius vs serverinis CMS) ir **inventoriaus suvienodinimas** tarp mokėjimo provider’ių.
