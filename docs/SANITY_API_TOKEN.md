# Kaip gauti Sanity API Token

## Problema
Jei matote šią klaidą:
```
Request error while attempting to reach https://6emr8ueu.apicdn.sanity.io/...
```

Tai reiškia, kad **SANITY_API_TOKEN** yra neteisingas arba neegzistuoja.

## Sprendimas: Sukurkite API Token

### Metodas 1: Per Sanity valdymo sąsają (Rekomenduojama)

#### 1. Eikite į Sanity valdymą
```
https://sanity.io/manage/personal/tokens
```
Arba:
```
https://www.sanity.io/manage/project/6emr8ueu/api
```

#### 2. Prisijunkite
Naudokite savo Sanity paskyrą.

#### 3. Sukurkite naują tokeną
1. Spauskite **"Add API token"** arba **"Create new token"**
2. Įveskite pavadinimą: `yakiwood-website-local` arba `development`
3. Pasirinkite teises:
   - **Viewer** - tik skaityti (pakanka development)
   - **Editor** - skaityti ir rašyti
   - **Administrator** - visos teisės

**Rekomenduojama:** Pradžiai naudokite **Viewer** (skaityti užtenka produktams rodyti).

#### 4. Nukopijuokite tokeną
⚠️ **SVARBU:** Tokeną pamatysite **tik vieną kartą**!
- Nukopijuokite jį iš karto
- Išsaugokite saugioje vietoje

#### 5. Įdėkite į `.env.local`
Atverkite `.env.local` failą ir pakeiskite:

**Senai:**
```env
SANITY_API_TOKEN="your-token-here"
```

**Nauja:**
```env
SANITY_API_TOKEN="skABCdefGHIjklMNOpqrSTUvwxYZ1234567890"
```
(naudokite savo realų tokeną)

#### 6. Perkraukite dev serverį
```bash
# Sustabdykite serverį (Ctrl+C)
# Paleiskite iš naujo
npm run dev
```

### Metodas 2: Per Sanity CLI

#### 1. Atidarykite terminalą projektė
```bash
cd c:\Users\rimvy\yakiwood-website
```

#### 2. Paleiskite Sanity manage
```bash
npx sanity manage
```

Tai atidarys naršyklę su Sanity valdymo sąsaja.

#### 3. Eikite į API skiltį
- Kairėje navigacijoje: **API**
- Pasirinkite **Tokens**

#### 4. Sukurkite tokeną (žr. Metodą 1, žingsnis 3-6)

## Kaip patikrinti ar veikia?

### 1. Perkraukite puslapį
```
http://localhost:3000/products
```

### 2. Patikrinkite konsolę (F12)
Turėtumėte matyti:
```
Loading products...
Fetching products from Sanity...
Fetched X products from Sanity
Products loaded: X
```

### Jei matote klaidą:
```
⚠️  SANITY API TOKEN ISSUE:
Make sure SANITY_API_TOKEN is set in .env.local
Get your token from: https://sanity.io/manage/personal/tokens
Or run: npx sanity manage
```
Tai reiškia, kad token vis dar neteisingas.

## Token saugumo patarimai

### ✅ Gerai:
- Laikykite `.env.local` faile (jis `.gitignore` sąraše)
- Naudokite **Viewer** teises development
- Sukurkite atskirą tokeną kiekvienai aplinkai (local, staging, production)

### ❌ Blogai:
- NIEKADA neįdėkite token į Git
- NIEKADA nesidalinkite token publiciai
- NIEKADA neįdėkite token į frontend kodą (tik `.env.local`)

## Token teisės

### Viewer (Read-only)
- ✅ Gauti produktus per API
- ✅ Rodyti produktus svetainėje
- ❌ Negalima kurti/redaguoti per API
- **Rekomenduojama development**

### Editor
- ✅ Gauti produktus
- ✅ Kurti/redaguoti per API
- ❌ Negalima trinti projektų/keisti nustatymų
- **Rekomenduojama production**

### Administrator
- ✅ Visos teisės
- ⚠️ **Atsargiai** - naudokite tik jei tikrai reikia

## Troubleshooting

### Token nepriimamas
1. Patikrinkite ar token nukopijuotas pilnai (be tarpų/naujų eilučių)
2. Patikrinkite ar `.env.local` faile teisingas formatas:
   ```env
   SANITY_API_TOKEN="jūsų-token-čia"
   ```
3. Perkraukite dev serverį po `.env.local` keitimo

### Token negalioja
1. Eikite į https://sanity.io/manage/personal/tokens
2. Patikrinkite ar token egzistuoja ir nėra ištrintas
3. Jei ištrintas - sukurkite naują

### Vis dar matau "your-token-here"
1. Patikrinkite ar redaguojate teisingą `.env.local` failą:
   ```
   c:\Users\rimvy\yakiwood-website\.env.local
   ```
2. Faile neturi būti kavučių blokų - tiesiai:
   ```env
   SANITY_API_TOKEN="sk..."
   ```

### Request error po token įdėjimo
1. Patikrinkite token teises (turi būti bent **Viewer**)
2. Patikrinkite ar token sukurtas teisingam projektui (6emr8ueu)
3. Bandykite sukurti naują tokeną

## Sekantys žingsniai

1. ✅ Sukurkite Sanity API tokeną
2. ✅ Įdėkite į `.env.local`
3. ✅ Perkraukite dev serverį
4. ✅ Atverkite http://localhost:3000/products
5. ✅ Turėtumėte matyti produktus (jei jie publikuoti)

## Nuorodos

- **Sanity Manage:** https://www.sanity.io/manage
- **API Tokens:** https://sanity.io/manage/personal/tokens
- **Projekto API:** https://www.sanity.io/manage/project/6emr8ueu/api
- **Sanity Studio:** http://localhost:3000/studio

---

**Greitoji komanda:**
```bash
# 1. Atidarykite Sanity valdymą
npx sanity manage

# 2. Eikite į API → Tokens
# 3. Sukurkite tokeną su Viewer teisėmis
# 4. Nukopijuokite tokeną
# 5. Įdėkite į .env.local
# 6. Perkraukite serverį
```
