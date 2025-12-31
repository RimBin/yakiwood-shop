# Sanity Produktų Pridėjimas

## Greitas Startas

### 1. Prisijunkite prie Sanity Studio

Eikite į: **http://localhost:3000/studio**

### 2. Sukurkite Produktą

1. Kairiame meniu paspauskite **"Product"**
2. Paspauskite **"Create"** mygtuką
3. Užpildykite produkto informaciją:

#### Būtini laukai:
- **Product Name** - Produkto pavadinimas (pvz., "Natūrali Shou Sugi Ban Lenta")
- **Slug** - URL adresas (pvz., "naturali-shou-sugi-ban-lenta")
- **Category** - Kategorija (pasirinkite iš sąrašo):
  - Facades (Fasadai)
  - Terraces (Terasosi)
  - Fences (Tvoros)
  - Interiors (Interjeras)
  - Furniture (Baldai)
- **Wood Type** - Medienos tipas (pasirinkite):
  - Larch (Maumedis)
  - Spruce (Eglė)
- **Base Price (EUR)** - Bazinė kaina eurais (pvz., 89)

#### Neprivalomi laukai:
- **Description** - Produkto aprašymas
- **Product Images** - Produkto nuotraukos (galite įkelti kelias)
- **Available Finishes** - Galimos apdailos:
  - Finish Name (pvz., "Natūrali")
  - Color Code (hex kodas, pvz., "#8B7355")
  - Finish Image (nuotrauka)
  - Price Modifier (kainų skirtumas, pvz., 0 arba 15)
- **Dimensions** - Matmenys:
  - Width (mm) - Plotis
  - Length (mm) - Ilgis
  - Thickness (mm) - Storis
- **Specifications** - Specifikacijos (Label ir Value poros):
  - Pvz.: "Mediena" → "Maumedis"
  - Pvz.: "Drėgmė" → "12-15%"
  - Pvz.: "Kilmė" → "Lietuva"
- **Featured Product** - Ar rodyti pradiniame puslapyje
- **In Stock** - Ar yra sandėlyje

### 3. Įrašykite Produktą

Paspauskite **"Publish"** mygtuką viršutiniame dešiniame kampe.

## Pavyzdinis Produktas

```json
{
  "name": "Natūrali Shou Sugi Ban Lenta - Maumedis",
  "slug": {
    "current": "naturali-lenta-maumedis"
  },
  "category": "facades",
  "woodType": "larch",
  "basePrice": 89,
  "description": "Aukštos kokybės maumedžio lenta, apdorota tradicine japonų Shou Sugi Ban technika. Tvirta, atspari drėgmei ir tinkama fasadų apdailai.",
  "dimensions": {
    "width": 140,
    "length": 3000,
    "thickness": 20
  },
  "specifications": [
    {
      "label": "Mediena",
      "value": "Sibirinis maumedis"
    },
    {
      "label": "Drėgmė",
      "value": "12-15%"
    },
    {
      "label": "Degimo lygis",
      "value": "Vidutinis"
    }
  ],
  "featured": true,
  "inStock": true
}
```

## Greitieji Produktai

Norėdami greitai sukurti kelis produktus testavimui:

### Eglės Produktas
- **Name**: Natūrali Shou Sugi Ban Lenta - Eglė
- **Wood Type**: Spruce
- **Category**: Facades
- **Base Price**: 75
- **Description**: Ekonomiška ir ekologiška eglės lenta, puikiai tinkanti fasadų apdailai.

### Maumedžio Produktas
- **Name**: Premium Shou Sugi Ban Lenta - Maumedis
- **Wood Type**: Larch
- **Category**: Terraces
- **Base Price**: 95
- **Description**: Aukščiausios kokybės maumedžio lenta terasoms ir lauko zonoms.

## Dažniausios Klaidos

### Klaida: "Slug is required"
**Sprendimas**: Automatiškai sugeneruojamas iš pavadinimo, bet reikia paspausti generavimo mygtuką šalia "Slug" lauko.

### Klaida: Produktas nerodomas puslapyje
**Patikrinkite**:
1. Ar produktas publikuotas (ne draft)?
2. Ar užpildyti visi būtini laukai (name, slug, category, woodType, basePrice)?
3. Ar "In Stock" pažymėta kaip `true`?

## Produktų Valdymas

### Redaguoti Produktą
1. Atidarykite produktą Studio
2. Atlikite pakeitimus
3. Paspauskite **"Publish"**

### Ištrinti Produktą
1. Atidarykite produktą
2. Meniu (⋯) paspauskite **"Delete"**
3. Patvirtinkite ištrynimą

### Pridėti Nuotraukas
1. Produkto redagavimo lange eikite į **"Product Images"**
2. Paspauskite **"Upload"**
3. Pasirinkite nuotrauką iš kompiuterio
4. Galite pridėti kelias nuotraukas - pirma bus pagrindinė

## Patarimai

1. **Naudokite aiškius pavadinimus**: Produkto pavadinimas turėtų aiškiai nurodyti, kas tai yra
2. **Užpildykite visus laukus**: Kuo daugiau informacijos, tuo geriau produktas atrodys
3. **Kokybė**: Įkelkite aukštos kokybės nuotraukas (bent 1200x1200 px)
4. **SEO**: Slug'as turėtų būti trumpas ir aiškus (naudokite brūkšnelius vietoj tarpų)
5. **Kategorijos**: Pasirinkite tinkamą kategoriją, kad klientai lengviau rastų produktą

## Pagalba

Jei kyla problemų:
1. Patikrinkite konsolę (F12 naršyklėje)
2. Pabandykite atnaujinti puslapį
3. Įsitikinkite, kad Sanity Studio veikia (http://localhost:3000/studio)
4. Patikrinkite `.env.local` faile Sanity konfigūraciją:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID="6emr8ueu"`
   - `NEXT_PUBLIC_SANITY_DATASET="production"`
