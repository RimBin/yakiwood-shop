# Produktų Kategorijos - Greitas Vadovas

## Kas pasikeitė?

Produktai dabar turi medienos tipo (`woodType`) kategoriją su dviem pasirinkimais:
- **Larch** (Maumedis)
- **Spruce** (Eglė)

## Kaip pridėti produktą su kategorija?

### 1. Atidarykite Sanity Studio
```
http://localhost:3000/studio
```

### 2. Sukurkite naują produktą

Būtinai užpildykite:
- **Product Name** - Pavadinimas
- **Slug** - URL (automatiškai generuojama)
- **Category** - Produkto tipas (Facades, Terraces, etc.)
- **Wood Type** - **NAUJAS!** Medienos tipas:
  - ✅ Larch (Maumedis)
  - ✅ Spruce (Eglė)
- **Base Price** - Kaina

### 3. Produkto puslapis

Produktų puslapyje (/products arba /produktai) bus:
- Filtrai pagal medienos tipą (Spruce wood / Larch wood)
- Medienos tipo rodymas kiekvienos kortelės apačioje
- Lietuviški pavadinimai: "Maumedis" ir "Eglė"

### 4. Produkto detalės

Produkto detalių puslapyje medienos tipas rodomas po produkto pavadinimu.

## Pavyzdys

```json
{
  "name": "Premium Fasadinė Lenta",
  "slug": { "current": "premium-fasadine-lenta" },
  "category": "facades",
  "woodType": "larch",  // ← NAUJAS LAUKAS
  "basePrice": 89,
  "description": "Aukštos kokybės maumedžio fasadinė lenta"
}
```

## Empty State

Jei produktų nėra, produktų puslapis rodys:
- Loading spinner kraunant duomenis
- Draugišką pranešimą "Produktų kol kas nėra"
- Nuorodą į kontaktų puslapį

## Sanity Schema

Schema lokacija: `sanity/schemaTypes/productType.ts`

woodType laukas:
```typescript
defineField({
  name: 'woodType',
  title: 'Wood Type',
  type: 'string',
  options: {
    list: [
      { title: 'Larch (Maumedis)', value: 'larch' },
      { title: 'Spruce (Eglė)', value: 'spruce' },
    ],
  },
  validation: (Rule) => Rule.required(),
})
```

## TypeScript Tipai

Tipai lokacija: `types/admin.ts`

```typescript
export type WoodType = 'larch' | 'spruce';

export const WOOD_TYPES: { value: WoodType; label: string }[] = [
  { value: 'larch', label: 'Maumedis (Larch)' },
  { value: 'spruce', label: 'Eglė (Spruce)' },
];
```

## Problemos?

### Produktai nerodomi
1. Patikrinkite ar produktai publikuoti (ne draft)
2. Ar užpildytas `woodType` laukas
3. Ar Sanity Studio veikia

### Filtrai neveikia
- Patikrinkite ar produktuose yra `woodType` reikšmė
- Perkraukite puslapį

### Deprecation Warning
Jei matote Sanity image-url deprecation warning - tai normalu, jis netrukdo veikimui ir bus pašalintas ateityje.

## Dokumentacija

Daugiau informacijos:
- [SANITY_PRODUCTS.md](./SANITY_PRODUCTS.md) - Kaip pridėti produktus
- [README.md](../README.md) - Pagrindinis projekto README
