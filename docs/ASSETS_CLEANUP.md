# Assets Valymo Ataskaita

**Data:** 2026-01-03

## Atlikti veiksmai

Buvo atliktas nenaudojamų assets failų valymas naudojant automatinį skriptą `scripts/clean-unused-assets.ps1`.

## Rezultatai

- **Ištrinta failų:** 97
- **Atlaisvinta vietos:** 7.61 MB
- **Likę failai:** 42

## Ištrinti failai

### Nenaudojami SVG failai (hash pavadinimai)
- 35 failai su hash pavadinimais (205c33e5dbae..., 2882f5b798ef..., ir kt.)

### Hero katalogo failai (5.2 MB)
- `Black larch shou sugi ban wooden plank for facade.svg` (2.15 MB)
- `Carbon larch shou sugi ban wooden plank for facade.svg` (2.51 MB)
- Sertifikatų PNG failai (cert1-6.png)
- Spalvų pavyzdžiai (color-black-larch.png, color-carbon-larch.png)
- Produktų nuotraukos (Img.png, Img-1.png ... Img-5.png, product-image.png)
- Mokėjimo logotipai (Maestro, Mastercard, PayPal, Stripe, Visa SVG versijos)

### Certifications katalogo failai
- `epd.png`, `epd.svg`
- `fsc.png`, `fsc.svg`
- `es-parama.png`, `es-parama.svg`

### Icons katalogo failai
- `coins.svg`, `cube.svg`, `eco-friendly.svg`, `fast-delivery.svg`, `fire.svg`
- `leaf.svg`, `money-back.svg`, `package.svg`, `plant.svg`, `warehouse.svg`
- `vector-top.svg`
- `package-part2.png`, `package-part3.png`, `package-part4.png`
- `px-input-fields-coins.svg`, `px-input-fields-package.svg`

### Payments katalogo failai
- `maestro.svg`, `mastercard.png`, `mastercard.svg`
- `paypal.svg`, `stripe.png`, `stripe.svg`
- `visa.png`, `visa.svg`

### Kiti failai
- `footer-divider.svg`, `footer-mask.png`

## Likę failai (naudojami)

### Pagrindiniai assets (`public/assets/`)
- **Projektų nuotraukos:** imgProject1-6.jpg
- **Medienos pavyzdžiai:** imgSpruce.png, imgLarch1.png, imgLarch2.png
- **Spalvų pavyzdžiai:** imgColor1-8.png
- **Fonas:** imgMask.jpg, imgVector33.jpg, imgVector37.jpg
- **Kategorijos:** imgFence.jpg, imgFacades.jpg, imgTerrace.jpg, imgInterior.jpg
- **UI elementai:** imgLogo.svg, imgCart.svg, imgLogo.jpg, imgCart.jpg
- **Sertifikatai:** cert-epd.png, cert-fsc.png, cert-eu.png

### Icons kataloge (`public/assets/icons/`)
- icon-base.png
- coins-base.png
- plant-base.png

### Rezervinės ikonos
- imgIconTruck.jpg, imgIconTruck.svg
- imgIconCoins.jpg, imgIconCoins.svg
- imgIconPlant.jpg, imgIconPlant.svg

### Konfigūracijos
- figma-manifest.json
- README.md (2 failai - vienas root, vienas products kataloge)

## Naudojimas kode

Visi likę assets yra apibrėžti `lib/assets.ts` faile ir naudojami šiuose komponentuose:
- `components/shared/Header.tsx` - logo, cart, ikonos
- `components/shared/AnnouncementBar.tsx` - truck, coins, plant ikonos
- `components/Products.tsx` - produktų nuotraukos, spalvos
- `components/Projects.tsx` - projektų nuotraukos
- `components/Solutions.tsx` - sprendimų kategorijų nuotraukos
- `components/modals/*.tsx` - logo modaluose

## Rezultatas

Asset'ai dabar optimizuoti ir yra saugomi tik tie, kurie tikrai naudojami projekte. Tai sumažins:
- Build laiką
- Bundle dydį
- Network transfer
- Disko vietą

## Ateityje

Jei reikės pridėti naujų assets:
1. Pridėti failą į `public/assets/`
2. Registruoti `lib/assets.ts` faile
3. Importuoti per `getAsset()` funkciją

Jei reikės ištrinti nebenaudojamus:
1. Paleisti `.\scripts\clean-unused-assets.ps1`
2. Patvirtinti ištrinimą
