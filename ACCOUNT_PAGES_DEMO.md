# Account Puslapių Demo Autentifikacija

## Kas Padaryta

### ✅ Login Puslapio Atnaujinimas
- Pašalintas Supabase priklausomybė
- Įdiegta paprasta localStorage autentifikacija
- Pridėti demo prisijungimo mygtukai ("Administratorius" ir "Vartotojas")
- Išversti visi tekstai į lietuvių kalbą

### ✅ Account Puslapio Atnaujinimas
- Pašalinta Supabase integracija
- Visi duomenys saugomi localStorage
- Trys skiltys:
  1. **Mano informacija** - vardas, pavardė, el. paštas, telefonas
  2. **Pristatymo informacija** - šalis, miestas, adresas, pašto kodas
  3. **Slaptažodis** - slaptažodžio keitimas (demo)
- Visi tekstai išversti į lietuvių kalbą
- Atsijungimo funkcionalumas

## Demo Kredencialai

### Admin
- **Email:** admin@yakiwood.lt
- **Password:** demo123
- **Redirect:** /admin

### User  
- **Email:** user@yakiwood.lt
- **Password:** demo123
- **Redirect:** /account

## Kaip Veikia

1. **Prisijungimas:**
   - Įveskite demo kredencialus arba
   - Paspauskite demo mygtuką
   - Sesija išsaugoma `localStorage.user`

2. **Account Valdymas:**
   - Redaguokite savo informaciją
   - Pridėkite pristatymo adresą
   - Pakeiskite slaptažodį (demo)
   - Duomenys saugomi `localStorage.user_data_{email}`

3. **Atsijungimas:**
   - Paspauskite "Atsijungti"
   - localStorage.user ištrinamas
   - Nukreipiama į /login

## Techniniai Detaliai

### Failai Pakeisti
- `app/login/page.tsx` - demo autentifikacija
- `app/account/page.tsx` - localStorage duomenų valdymas

### localStorage Struktūra
```javascript
// Sesijos duomenys
localStorage.user = {
  email: "user@yakiwood.lt",
  role: "user",
  name: "Demo User"
}

// Vartotojo duomenys
localStorage.user_data_{email} = {
  firstName: "Demo",
  lastName: "User",
  phone: "+370...",
  country: "Lietuva",
  city: "Vilnius",
  address: "...",
  postalCode: "..."
}
```

## Svarbios Pastabos

⚠️ **Tai tik DEMO aplinka:**
- Nėra tikros autentifikacijos
- Duomenys nėra saugūs
- Produkcijoje reikia pilno Supabase ar OAuth integravimo

✅ **Veikia:**
- Demo prisijungimas
- Duomenų redagavimas ir išsaugojimas
- Atsijungimas
- Navigacija tarp skyrių
- Lietuviški tekstai

🔧 **Reikia papildyti produkcijoje:**
- Tikra autentifikacija (Supabase/Auth0/etc)
- Backend API integracijos
- Duomenų bazės saugojimas
- Email validacija
- Slaptažodžio keitimo funkcionalumas
- Sesijos galiojimo laikas
