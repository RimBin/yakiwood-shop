# Sąskaitų generavimo sistema

Išsami lietuviška sąskaitų faktūrų generavimo ir PDF kūrimo sistema.

## 🎯 Funkcionalumas

- ✅ **Profesionalios PDF sąskaitos** - Automatinis lietuviškų sąskaitų faktūrų generavimas
- ✅ **Visiškai lietuviška** - Visos etiketės, formatai ir datos lietuvių kalba
- ✅ **Lanksti konfigūracija** - Pritaikomas įmonės informacijai
- ✅ **Automatiniai skaičiavimai** - PVM, tarpinės sumos, viso suma
- ✅ **Keturių rūšių mokėjimas** - Bankas, grynaisiais, kortele, Stripe
- ✅ **Sąskaitų būsenos** - Juodraštis, išrašyta, apmokėta, vėluoja, atšaukta
- ✅ **Pilna CRUD sistema** - Kurti, skaityti, atnaujinti, trinti
- ✅ **LocalStorage** - Demonstracinis duomenų saugojimas (gamyboje - duomenų bazė)

## 📁 Struktūra

```
types/invoice.ts              # TypeScript tipų apibrėžimai
lib/invoice/
  ├── pdf-generator.ts        # PDF generavimo klasė (jsPDF)
  └── utils.ts                # Verslo logika ir CRUD operacijos
app/api/invoices/
  ├── route.ts                # GET - sąskaitų sąrašas
  ├── generate/route.ts       # POST - naujos sąskaitos kūrimas
  └── [id]/pdf/route.ts       # GET - PDF parsisiuntimas
app/account/invoices/
  ├── page.tsx                # Sąskaitų sąrašo puslapis
  └── create/page.tsx         # Naujos sąskaitos formos puslapis
```

## 🚀 Kaip naudoti

### 1. Sąskaitų sąrašo peržiūra

Prisijungę vartotojai gali pasiekti `/account/invoices`:

```typescript
// Automatiškai rodomas:
- Statistikos dashboard (viso, apmokėta, laukiama, vėluoja)
- Sąskaitų lentelė su visomis detalėmis
- Veiksmai: PDF parsisiuntimas, būsenos keitimas, trynimas
```

### 2. Naujos sąskaitos sukūrimas

Eiti į `/account/invoices/create` arba spausti "Nauja sąskaita":

```typescript
// Forma turi 3 sekcijas:
1. Pirkėjo informacija (vardas, įmonė, adresas, kontaktai)
2. Prekės/paslaugos (pavadinimas, kiekis, kaina, PVM)
3. Mokėjimas ir pastabos (būdas, terminas, komentarai)

// Įrašius:
- Automatiškai generuojamas PDF
- Išsaugoma localStorage
- Peradresuojama į sąrašą
```

### 3. Programinis naudojimas

#### Sukurti sąskaitą su JavaScript

```typescript
import { createInvoice, saveInvoice } from '@/lib/invoice/utils';
import { downloadInvoicePDF } from '@/lib/invoice/pdf-generator';

const request = {
  buyer: {
    name: 'Jonas Jonaitis',
    companyName: 'UAB "Pavyzdinė įmonė"',
    companyCode: '123456789',
    vatCode: 'LT123456789',
    address: 'Gedimino pr. 1',
    city: 'Vilnius',
    postalCode: '01103',
    country: 'Lietuva',
    email: 'jonas@example.lt',
    phone: '+370 600 00000'
  },
  items: [
    {
      id: 'item-1',
      name: 'Deginta mediena - Lentos',
      quantity: 10,
      unitPrice: 89.90,
      vatRate: 0.21
    }
  ],
  paymentMethod: 'bank_transfer',
  dueInDays: 14,
  notes: 'Apmokėti per 14 dienų'
};

// Sukurti ir išsaugoti
const invoice = createInvoice(request);
saveInvoice(invoice);

// Parsisiųsti PDF
downloadInvoicePDF(invoice);
```

#### API endpoint'ai

**GET /api/invoices** - Gauti visas sąskaitas
```bash
curl http://localhost:3000/api/invoices
```

**POST /api/invoices/generate** - Sukurti naują sąskaitą
```bash
curl -X POST http://localhost:3000/api/invoices/generate \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": {...},
    "items": [...],
    "paymentMethod": "bank_transfer",
    "dueInDays": 14
  }'
```

**GET /api/invoices/{id}/pdf** - Parsisiųsti PDF
```bash
curl http://localhost:3000/api/invoices/{invoice-id}/pdf \
  --output saskaita.pdf
```

## 📊 Duomenų struktūra

### Invoice tipas

```typescript
interface Invoice {
  id: string;                    // Unikalus ID (uuid)
  invoiceNumber: string;         // Numeris (YW-YYYYMM-0001)
  seller: InvoiceAddress;        // Pardavėjo duomenys
  buyer: InvoiceAddress;         // Pirkėjo duomenys
  items: InvoiceItem[];          // Prekės/paslaugos
  subtotal: number;              // Tarpinė suma (be PVM)
  vatAmount: number;             // PVM suma
  total: number;                 // Visa suma (su PVM)
  status: InvoiceStatus;         // Būsena
  issuedAt: string;              // Išrašymo data
  dueDate: string;               // Apmokėjimo terminas
  paidAt?: string;               // Apmokėjimo data (jei apmokėta)
  paymentMethod: PaymentMethod;  // Mokėjimo būdas
  notes?: string;                // Pastabos
  createdAt: string;             // Sukūrimo data
  updatedAt: string;             // Atnaujinimo data
}
```

### Automatiniai skaičiavimai

```typescript
// Prekės suma (su PVM)
const itemTotal = quantity * unitPrice * (1 + vatRate);

// Tarpinė suma (be PVM)
const subtotal = items.reduce((sum, item) => 
  sum + (item.quantity * item.unitPrice), 0
);

// PVM suma
const vatAmount = items.reduce((sum, item) => 
  sum + (item.quantity * item.unitPrice * item.vatRate), 0
);

// Visa suma
const total = subtotal + vatAmount;
```

## 🎨 PDF dizainas

PDF sąskaitos generuojamos su:

- **Antraštė**: Logotipas + "SĄSKAITA FAKTŪRA" + numeris
- **Pardavėjas/Pirkėjas**: Dviejų stulpelių išdėstymas
- **Prekių lentelė**: Pavadinimas, kiekis, kaina, PVM, suma
- **Suma**: Tarpinė suma, PVM, viso
- **Poraštė**: Mokėjimo detalės, terminas, pastabos

```typescript
// PDF konfigūracija
- Formatas: A4
- Šriftas: Roboto (palaiko lietuviškas raides)
- Spalvos: #161616 (juoda), #535353 (pilka)
- Kraštinės: 20mm
```

## 🔧 Konfigūracija

### Įmonės duomenys

Redaguoti `lib/invoice/utils.ts`:

```typescript
export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  seller: {
    name: 'UAB "YAKIWOOD"',
    companyCode: '123456789',
    vatCode: 'LT123456789012',
    address: 'Gedimino pr. 1',
    city: 'Vilnius',
    postalCode: '01103',
    country: 'Lietuva',
    phone: '+370 600 00000',
    email: 'info@yakiwood.lt',
    website: 'https://yakiwood.lt',
    bankName: 'Swedbank',
    bankAccount: 'LT12 7300 0101 2345 6789'
  },
  invoicePrefix: 'YW',
  locale: 'lt-LT',
  currency: 'EUR',
  defaultVatRate: 0.21,
  defaultDueInDays: 14
};
```

## 🚨 Svarbu

### LocalStorage ribojimas

Dabartinė versija naudoja `localStorage` demonstracijai:
- ⚠️ **Duomenys saugomi naršyklėje** - Išvalius cache, prarandami
- ⚠️ **5-10 MB limitas** - Dideliam kiekiui nepakanka
- ⚠️ **Nėra saugos** - Bet kas gali peržiūrėti

### Gamybai

Pakeisti į:
- ✅ **Supabase/PostgreSQL** - Patikimas duomenų saugojimas
- ✅ **Autentifikacija** - Sąskaitos privačios kiekvienam vartotojui
- ✅ **Failų saugykla** - PDF failai AWS S3 arba Vercel Blob
- ✅ **El. paštas** - Automatinis sąskaitų siuntimas (Resend API)

## 📧 El. pašto integracija (TODO)

```typescript
// Būsimas funkcionalumas
import { Resend } from 'resend';

async function sendInvoiceEmail(invoice: Invoice) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const pdfBuffer = new InvoicePDFGenerator(invoice).generate();
  
  await resend.emails.send({
    from: 'info@yakiwood.lt',
    to: invoice.buyer.email!,
    subject: `Sąskaita faktūra ${invoice.invoiceNumber}`,
    html: `<p>Gerb. ${invoice.buyer.name},</p>
           <p>Siunčiame sąskaitą faktūrą ${invoice.invoiceNumber}.</p>`,
    attachments: [{
      filename: `saskaita_${invoice.invoiceNumber}.pdf`,
      content: pdfBuffer
    }]
  });
}
```

## 🧪 Testavimas

1. **Prisijungti** su demo duomenimis:
   - Email: `admin@yakiwood.lt`
   - Slaptažodis: `demo123`

2. **Eiti į sąskaitas**: `/account/invoices`

3. **Sukurti testinę sąskaitą**:
   - Spausti "+ Nauja sąskaita"
   - Užpildyti formą
   - Paspausti "Sukurti sąskaitą"

4. **Patikrinti PDF**: 
   - Turėtų automatiškai atsisiųsti
   - Peržiūrėti formatavimą, lietuviškas raides

5. **Valdyti sąskaitas**:
   - Pažymėti kaip apmokėta
   - Parsisiųsti dar kartą
   - Ištrinti

## ❓ Dažni klausimai

**Ar reikia backend'o?**
Ne, visa sistema veikia frontend'e su localStorage. Gamybai rekomenduojamas tikras backend.

**Kaip pridėti savo logotipą?**
`lib/invoice/pdf-generator.ts` → `addHeader()` metodą → pakeisti `logo` kintamąjį į savo Base64 paveikslėlį.

**Ar veikia lietuviškos raidės?**
Taip, naudojamas Roboto šriftas, kuris palaiko visus lietuviškus simbolius.

**Kaip keisti PVM tarifą?**
`DEFAULT_INVOICE_SETTINGS.defaultVatRate` arba formoje kiekvienai prekei atskirai.

**Ar galima eksportuoti į Excel?**
Šiuo metu tik PDF. Excel galima pridėti su `xlsx` biblioteka.

## 📝 Licencija

Ši sąskaitų sistema yra Yakiwood projekto dalis.
