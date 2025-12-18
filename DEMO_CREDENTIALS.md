# Demo Prisijungimo Duomenys

Svetainėje galima prisijungti su demo paskyromis be Supabase autentifikacijos.

## Demo Paskyros

### Administratoriaus Paskyra
- **El. paštas:** `admin@yakiwood.lt`
- **Slaptažodis:** `demo123`
- **Nukreipiama į:** `/admin` (administratoriaus valdymo skydelis)

### Vartotojo Paskyra
- **El. paštas:** `user@yakiwood.lt`
- **Slaptažodis:** `demo123`
- **Nukreipiama į:** `/account` (vartotojo paskyra)

## Kaip Prisijungti

1. Eikite į [/login](http://localhost:3000/login) puslapį
2. Įveskite vieną iš demo el. paštų ir slaptažodžių arba
3. Paspauskite vieną iš demo mygtukų apačioje:
   - **Administratorius** - prisijungia kaip admin
   - **Vartotojas** - prisijungia kaip vartotojas

## Funkcionalumas

### Account Puslapyje (/account)
- **Mano informacija** - redaguoti vardą, pavardę, el. paštą, telefoną
- **Pristatymo informacija** - pridėti/redaguoti pristatymo adresą
- **Slaptažodis** - pakeisti slaptažodį (demo režime)

Visi duomenys saugomi naršyklės `localStorage` ir išlieka tarp sesijų.

## Techninis Įgyvendinimas

- Autentifikacija vykdoma kliento pusėje (localStorage)
- Demo vartotojai apibrėžti `app/login/page.tsx` faile
- Sesijos duomenys saugomi `localStorage.user` raktu
- Papildomi vartotojo duomenys saugomi `localStorage.user_data_{email}` raktu
- Atsijungti: ištrinama `localStorage.user` reikšmė

## Svarbu

⚠️ Tai tik DEMO aplinka. Produkcijoje reikės pilno Supabase ar kitos autentifikacijos sistemos įdiegimo.
