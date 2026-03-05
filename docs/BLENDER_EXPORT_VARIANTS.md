# Blender: eksportuoti GLB variantus pagal spalvą

Šitas repo turi per-spalvą „finish“ paveikslus (pvz. `public/assets/finishes/larch/...`), bet dabartiniai GLB modeliai yra bendri visoms spalvoms.

Kad 3D modelyje spalvos persijungtų kaip Blender, patogiausia turėti po vieną GLB kiekvienai spalvai.

## 1) Reikalavimai

- Įdiegtas Blender (CLI `blender` pasiekiamas iš terminalo), arba naudok pilną kelią iki `blender.exe`.
- Turi `.blend` failą su modeliu (pvz. terasa/fasadas) ir teisingai sukonfigūruotomis medžiagomis.

## 2) Paleidimas (Windows PowerShell)

Komanda (pavyzdys maumedžiui/terasai):

```powershell
blender --background C:\kelias\iki\scene.blend --python scripts/blender/export_color_variants.py -- `
  --wood larch --model terrace --outputDir public/models/products `
  --texturesDir public/assets/finishes/larch
```

Eglei:

```powershell
blender --background C:\kelias\iki\scene.blend --python scripts/blender/export_color_variants.py -- `
  --wood spruce --model terrace --outputDir public/models/products `
  --texturesDir public/assets/finishes/spruce
```

## 3) WEBP pastaba

Jei tekstūros yra `.webp`, Blender eksportas gali įdėti `EXT_texture_webp` į GLB.
Naršyklėse tai kartais sukelia problemas (priklausomai nuo loaderio / CSP / fallback).

Repo turi post-processing skriptą, kuris konvertuoja GLB viduje esančias WEBP į PNG ir pašalina `EXT_texture_webp`:

```powershell
node scripts/convert-glb-webp-to-png.mjs public/models/products/larch-terrace-carbon.glb public/models/products/larch-terrace-carbon.png.glb
```

(jei nori, galim praplėsti skriptą, kad perrašytų „in-place“ arba batch’intų visus variantus.)

## 4) Toliau

Kai GLB variantai jau sukurti, galima:

- atnaujinti `public/models/products/index.json`, kad kiekviena spalva rodytų savo GLB,
- arba palikti vieną GLB ir perjunginėti tekstūras kode (jei GLB turi visus reikalingus map’us ir UV kanalus).
