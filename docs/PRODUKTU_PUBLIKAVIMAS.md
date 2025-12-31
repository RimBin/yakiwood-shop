# Kaip publikuoti produktus Sanity Studio

## Problema
Jei matote "No products yet" puslapyje `/products`, nors sukūrėte produktus Sanity Studio, tai reiškia, kad produktai yra **draft** (juodraščių) būsenoje ir nepublikuoti.

## Sprendimas: Publikuokite produktus

### 1. Atidarykite Sanity Studio
```
http://localhost:3000/studio
```

### 2. Eikite į "Product" skilti
Kairėje navigacijoje pasirinkite **Product**.

### 3. Pasirinkite produktą
Sąraše pasirinkite produktą, kurį norite publikuoti.

### 4. Publikuokite
Dešinėje pusėje, viršuje, rasite mygtuką **"Publish"** (žalias).
- Spauskite **"Publish"** arba **Ctrl+Alt+P** (Windows) / **Cmd+Opt+P** (Mac)
- Produktas bus publikuotas ir bus matomas svetainėje

### 5. Atnaujinkite puslapį
Grįžkite į `/products` puslapį ir atnaujinkite (F5). Produktai turėtų pasirodyti.

## Draft vs Published būsenos

### Draft (Juodraštis)
- **ID prasideda su `drafts.`** (pvz., `drafts.abc123`)
- **NEMATOMAS** per API užklausas (nebent specialiai filtruojama)
- Gali būti redaguojamas bet kada
- Automatiškai sukuriamas kai kuriate naują dokumentą

### Published (Publikuotas)
- **ID be `drafts.` prefikso** (pvz., `abc123`)
- **MATOMAS** per API užklausas
- Rodomas svetainėje
- Galima redaguoti - tai sukuria naują draft versiją

## Kaip veikia Draft → Published workflow

1. **Sukuriate produktą** → Sanity Studio sukuria `drafts.product-123`
2. **Redaguojate draft** → Visi pakeitimai išsaugomi draft versijoje
3. **Spaudžiate Publish** → Sukuriamas/atnaujinamas `product-123` (be drafts prefikso)
4. **API užklausa** → Grąžina tik publikuotas versijas (`product-123`)

## Masinis publikavimas

Jei turite daug produktų publikuoti:

1. **Vision** įrankis Sanity Studio:
   - Eikite į **Vision** skirtuką
   - Paleiskite užklausą:
   ```groq
   *[_type == "product" && _id in path("drafts.**")]
   ```
   - Tai parodys visus nepublikuotus produktus

2. **Vienu metu publikuoti negalima** - reikia kiekvieną atskirai publikuoti per Studio UI

## Debugging

### Patikrinti draft produktus
```groq
// Visi draft produktai
*[_type == "product" && _id in path("drafts.**")] {
  _id,
  name,
  slug
}
```

### Patikrinti publikuotus produktus  
```groq
// Visi publikuoti produktai
*[_type == "product" && !(_id in path("drafts.**"))] {
  _id,
  name,
  slug
}
```

### Patikrinti abu
```groq
// Visi produktai (draft + published)
*[_type == "product"] {
  _id,
  name,
  "isDraft": _id in path("drafts.**")
}
```

## Laikinas sprendimas (Development)

Dabartinė `fetchProducts()` funkcija **laikinai rodo ir draft produktus** derinimo tikslais.

**Failas:** `lib/products.sanity.ts`

```typescript
// DABARTINĖ VERSIJA (rodo draft + published):
const query = groq`*[_type == "product"] | order(_createdAt desc) {...}`

// PRODUCTION VERSIJA (tik published - atkomentuoti vėliau):
// const query = groq`*[_type == "product" && !(_id in path("drafts.**"))] {...}`
```

### Kada grąžinti production versiją?
Kai:
1. Visi produktai publikuoti
2. Įsitikinate, kad viskas veikia
3. Norite, kad draft produktai nebūtų matomi svetainėje

Tada `lib/products.sanity.ts` pakeiskite užklausą į:
```typescript
const query = groq`*[_type == "product" && !(_id in path("drafts.**"))] | order(_createdAt desc) {...}`
```

## Greitieji klavišai Sanity Studio

- **Ctrl+Alt+P** / **Cmd+Opt+P** - Publish
- **Ctrl+Alt+U** / **Cmd+Opt+U** - Unpublish (grąžina į draft)
- **Ctrl+S** / **Cmd+S** - Save draft
- **Ctrl+Alt+D** / **Cmd+Opt+D** - Discard draft changes

## Pagalba

Jei vis tiek matote "No products yet":

1. **Patikrinkite konsolę** - browser Developer Tools (F12)
   - Ieškokite `Fetched X products from Sanity`
   - Jei `Fetched 0 products` - produktai nepublikuoti arba neegzistuoja
   
2. **Patikrinkite Sanity Studio**
   - Eikite į `/studio`
   - Pasirinkite Product
   - Ar produktai turi žalią "Published" indikatorių?

3. **Patikrinkite API tokeną**
   - `.env.local` failas turi turėti `SANITY_API_TOKEN`
   - Token turi read teises

4. **Atnaujinkite puslapį** po publikavimo
   - Produktai nekešuojami realtime
   - Reikia atnaujinti puslapį (F5)

## Sekantys žingsniai

1. ✅ Sukurkite produktus Sanity Studio
2. ✅ **Publikuokite** juos (svarbu!)
3. ✅ Atnaujinkite `/products` puslapį
4. ✅ Turėtumėte matyti produktus su filtravimo mygtukais (Larch/Spruce)
