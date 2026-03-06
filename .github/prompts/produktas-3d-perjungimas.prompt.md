---
description: "Rask produkto puslapio 3D perjungimą ir patikrink, ar jis surištas su Konfiguratorius3D modelių registry (GLB)"
name: "Produktas: 3D perjungimas"
argument-hint: "slug=<produkto-slug> (nebūtina)"
agent: "agent"
---

Tavo užduotis: surasti, kur produkto puslapyje įjungiamas 3D vaizdas, ir patikrinti, kad 3D žiūryklė krauna teisingą GLB modelį iš registry.

**Įvestis**
- Jei vartotojas pateikė `slug=...`, naudok jį kaip testinį pavyzdį.
- Jei `slug` nepateiktas, naudok vieną realų `lt` produkto slug iš duomenų/seed’ų arba `public/models/products/index.json` raktų.

**Veiksmai**
1. Rask produkto detalaus puslapio route’ą (pvz. `/produktai/[slug]`) ir nustatyk, koks client komponentas renderina galeriją.
2. Atidaryk komponentą ir:
   - surask 3D perjungimo mygtuką (tekstas/aria-label) ir state’ą, kuris jungia foto ↔ 3D;
   - surask, kur renderinamas `DynamicKonfiguratorius3D` / `Konfiguratorius3D`;
   - patikrink, ar jam paduodamas `modelUrl={getProductModelUrl(...)}` ir ar `selectedColorId` / `selectedFinishId` perduodami iš produkto pasirinkimų.
3. Patikrink registry:
   - `lib/models.ts` (rezoliucijos tvarka: slug → category+wood → fallback)
   - `public/models/products/index.json` (slug → failo kelias)
   - `public/models/products/` (ar failai realiai egzistuoja)
4. Jei randi mapping’ą į neegzistuojantį `.glb`:
   - **nekurk naujų asset’ų**;
   - pasiūlyk saugų fallback (pvz. nukreipti į egzistuojantį artimiausią modelį arba `getGenericModelUrl()`), ir pateik minimalų patch’ą.

**Išvestis (formatas)**
- Kur yra 3D perjungimas: pateik 1–2 nuorodas į konkrečius file/line range.
- Kaip parenkamas modelis: trumpai aprašyk, iš kur ateina `modelUrl` ir kokia fallback logika.
- Greita verifikacija: jei `slug` duotas, parašyk, į kokį kelią jis turėtų resolvintis (pagal `index.json` / fallbacks).
- Jei reikia pataisų: pateik tik minimalias, tiesiogiai su problema susijusias.
