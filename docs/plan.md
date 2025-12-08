# Projekto planas – svetainė su el. parduotuve

Šį planą naudoja `planner-supervisor` agentas, kad patikrintų, kas jau įvykdyta, ir paskirstytų darbus kitiems agentams (`ui-agent`, `backend-agent`, `tests-agent`).

Kiekviena užduotis turi būti pažymėta:
- [ ] neįvykdyta
- [x] įvykdyta

---

## 1. Dizaino adaptacija

**Atsakingas agentas:** `ui-agent` (kartu su `planner-supervisor` analizei)

- [ ] 1.1 Analizė ir adaptacija pagal kliento pasirinktus svetainių pavyzdžius  
      - Išanalizuoti pateiktus pavyzdžius, identifikuoti pagrindinius UI/UX paternius.
      - Sudaryti sąrašą sekcijų ir komponentų, kuriuos reikia atkartoti ar adaptuoti.

- [ ] 1.2 Spalvų paletės, šriftų ir grafinių elementų derinimas  
      - Nustatyti galutinę spalvų paletę.
      - Pasirinkti šriftus ir jų dydžius (H1–H6, body, mygtukai).
      - Aprašyti ikonų, iliustracijų ir kitų grafinių elementų stilių.

- [ ] 1.3 Vizualinio stiliaus suderinimas su prekės ženklo identiteto strategija  
      - Sulyginti dizainą su brandbook’u (jei yra).
      - Aprašyti „design guidelines“ (tonas, nuotraukų stilistika, atstumai, grid sistema).

---

## 2. Svetainės mobilumo užtikrinimas

**Atsakingas agentas:** `ui-agent` + `tests-agent`

- [ ] 2.1 Dizaino adaptacija mobiliems telefonams ir planšetėms  
      - Sukurti responsive layout’us pagrindiniams breakpoint’ams (mobilus, planšetė, desktop).
      - Patikrinti, kad visos pagrindinės sekcijos išlieka skaitomos ir patogios.

- [ ] 2.2 Testavimas įvairiose platformose ir naršyklėse  
      - Patikrinti svetainės veikimą Chrome, Safari, Firefox, Edge (bent po 1 desktop, 1 mobilų).
      - Fiksuoti ir taisyti layout’o, scroll’o, click’ų problemas.

---

## 3. Puslapių struktūros kūrimas

**Atsakingas agentas:** `ui-agent` (+ `backend-agent` interaktyvumui)

- [ ] 3.1 Meniu, antraščių ir kitų puslapio elementų organizavimas  
      - Sukurti pagrindinę meniu struktūrą (header, footer, submeniu).
      - Aprašyti puslapių hierarchiją.

- [ ] 3.2 Svetainės navigacijos kūrimas ir optimizavimas  
      - Įdiegti patogią navigaciją (breadcrumb’ai, CTA keliai, vidinės nuorodos).
      - Patikrinti, ar vartotojas lengvai randa pagrindinius puslapius (parduotuvė, kontaktai, kt.).

- [ ] 3.3 Interaktyvių elementų kūrimas  
      - Mygtukai, dropdown’ai, accordion’ai, modal langai, žingsninės formos ir pan.
      - Užtikrinti aiškų hover/active/focus būsenų dizainą.

- [ ] 3.4 Puslapio programavimo darbai  
      - Implementuoti puslapius (HTML/JSX/TSX), pririšti prie CMS ar router’io.
      - Patikrinti, kad visos nuorodos veikia, nėra tuščių puslapių.

---

## 4. Elektroninės komercijos modulio integracija

**Atsakingas agentas:** `backend-agent` (+ `ui-agent` UI daliai, `tests-agent` testams)

- [ ] 4.1 Pardavimų procesų įdiegimas, automatizavimas ir optimizavimas  
      - Nustatyti pilną pirkimo kelią: produktas → krepšelis → checkout → apmokėjimas → patvirtinimas.
      - Implementuoti el. laiškų šablonus (užsakymo patvirtinimas, statuso keitimas).

- [ ] 4.2 Automatinis prekių atsargų valdymo diegimas  
      - Pririšti produktus prie atsargų sistemos.
      - Nustatyti atsargų mažinimo/atnaujinimo logiką po užsakymo.

- [ ] 4.4 Prekių krepšelio ir užsakymo puslapių kūrimas  
      - Sukurti krepšelio UI (prekių sąrašas, kainos, nuolaidos, pristatymas).
      - Sukurti checkout puslapio struktūrą ir logiką.

---

## 5. Parduotuvės filtrų konfigūracija

**Atsakingas agentas:** `backend-agent` + `ui-agent`

- [ ] 5.1 Paieškos rezultatų kūrimas ir programavimas  
      - Įdiegti paiešką pagal pavadinimą, kategoriją ir kitus filtrus.
      - Užtikrinti greitą ir tikslų rezultatų pateikimą.

- [ ] 5.2 Prekių filtravimas pagal parametrus  
      - Filtravimas pagal kategorijas, kainas, prekės ženklus ir kitus atributus.
      - Užtikrinti, kad filtrai gali būti kombinuojami ir veiktų be klaidų.

---

## 6. Mokėjimų būdų integracija

**Atsakingas agentas:** `backend-agent` (+ `tests-agent`)

- [ ] 6.1 PayPal, Paysera, Stripe ir kitų mokėjimo šaltinių integravimas  
      - Pridėti ir sukonfigūruoti reikiamus mokėjimo tiekėjus.
      - Užtikrinti saugų duomenų perdavimą.

- [ ] 6.2 Automatiniai mokėjimo patvirtinimai ir ataskaitos  
      - Implementuoti automatinį mokėjimų statuso tikrinimą (webhook’ai ar API).
      - Sutvarkyti ataskaitas administracijai (pvz., dienos/periodo pardavimai).

---

## 7. Integracijos su išorinėmis sistemomis

**Atsakingas agentas:** `backend-agent`

- [ ] 7.1 Elektroninio pašto rinkodaros įrankių integracija  
      - Prijungti newsletter / marketingo platformas (pvz., MailerLite, Mailchimp ir pan.).
      - Realizuoti automatinį kontaktų siuntimą iš formų/pirkimų.

- [ ] 7.2 Socialinių tinklų ir trečiųjų šalių platformų integracija  
      - Pridėti „share“ mygtukus, pixel kodus (Meta, Google, kt.).
      - Įdiegti kitų platformų integracijas pagal poreikį.

---

## 8. Daugiakalbiškumas

**Atsakingas agentas:** `backend-agent` + `ui-agent`

- [ ] 8.1 Svetainės daugiakalbiškumo modulio programavimas  
      - Paruošti struktūrą kelioms kalboms (URL, turinio išskyrimas, vertimų logika).

- [ ] 8.2 Kalbos perjungimo mygtuko integracija  
      - Sukurti UI perjungiklį (kalbos pasirinkimas).
      - Užtikrinti, kad perjungimas veiktų visuose pagrindiniuose puslapiuose.

---

## 9. Turinio valdymo sistema (CMS)

**Atsakingas agentas:** `backend-agent` (+ `ui-agent` redaktorių UI)

- [ ] 9.1 Turinio valdymo sistemos integracija  
      - Prijungti arba suprogramuoti CMS sprendimą (WordPress / custom / headless ir t.t.).

- [ ] 9.2 Turinio redaktoriaus integracija  
      - Sukurti patogią sąsają tekstų, nuotraukų ir kitų blokų redagavimui.

- [ ] 9.3 Vartotojo teisių ir prieigos valdymas  
      - Sukurti roles (admin, redaktorius, kt.).
      - Nustatyti, kas ką gali redaguoti.

- [ ] 9.4 Skirtingų turinio tipų valdymo galimybės  
      - Apibrėžti ir sukurti turinio tipus (straipsniai, projektai, produktai, DUK ir pan.).

---

## 10. Vidinis SEO, greitis ir saugumas

**Atsakingas agentas:** `backend-agent` + `tests-agent` (+ `ui-agent` turinio/markup daliai)

- [ ] 10.1 Raktinių žodžių integracija į turinį, meta žymes ir URL  
      - Nustatyti meta title/description struktūrą.
      - Priderinti URL struktūrą prie SEO strategijos.

- [ ] 10.2 Nuotraukų optimizacija SEO  
      - Alt tekstai, failų pavadinimai, dydžio optimizavimas.

- [ ] 10.3 Serverio nustatymai siekiant maksimalaus greičio  
      - Kešavimas, gzip/brotli, CDN (jei taikoma), statinio turinio tvarkymas.

- [ ] 10.4 Struktūrizuotų duomenų integracija  
      - Google Rich Snippets optimizavimas (Produktai, Breadcrumb, FAQ ir kt.).

- [ ] 10.5 Saugumo priemonių integracija  
      - Apsauga nuo bruteforce, XSS, CSRF, atnaujinimų politika.

- [ ] 10.6 SSL sertifikato integracija  
      - Užtikrinti, kad svetainė veikia tik per HTTPS.

- [ ] 10.7 Atsarginių kopijų kūrimas ir atkūrimo modulio integracija  
      - Nustatyti backup’ų periodiškumą.
      - Aprašyti, kaip atkurti svetainę iš backup’o.
