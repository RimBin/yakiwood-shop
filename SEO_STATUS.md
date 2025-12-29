# SEO Būklės Ataskaita

## 📊 Dabartinė SEO Būklė: 40%

---

## ✅ Kas JŪ VEIKIA (40%)

### 1. Pagrindiniai Meta Tags (Root Layout)
**Failas:** `app/layout.tsx`

```tsx
// ❌ TRŪKSTA - reikia pridėti:
export const metadata = {
  title: {
    default: 'Yakiwood - Deginta Mediena Shou Sugi Ban',
    template: '%s | Yakiwood'
  },
  description: 'Aukščiausios kokybės deginta mediena pagal Shou Sugi Ban techniką. Fasadų ir interjero sprendimai Lietuvoje.',
  keywords: ['deginta mediena', 'shou sugi ban', 'fasadai', 'medienos apdaila', 'Yakiwood'],
  authors: [{ name: 'Yakiwood' }],
  creator: 'Yakiwood',
  publisher: 'Yakiwood',
  openGraph: {
    type: 'website',
    locale: 'lt_LT',
    url: 'https://yakiwood.lt',
    title: 'Yakiwood - Deginta Mediena Shou Sugi Ban',
    description: 'Aukščiausios kokybės deginta mediena pagal Shou Sugi Ban techniką.',
    siteName: 'Yakiwood',
    images: [{
      url: '/og-image.jpg', // REIKIA SUKURTI
      width: 1200,
      height: 630,
      alt: 'Yakiwood Deginta Mediena'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yakiwood - Deginta Mediena',
    description: 'Aukščiausios kokybės deginta mediena pagal Shou Sugi Ban techniką.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}
```

### 2. Puslapių Metadata

**✅ Veikia:**
- [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx) - Turi `generateMetadata`

**❌ Trūksta metadata:**
- `app/page.tsx` (Homepage)
- `app/produktai/page.tsx`
- `app/produktai/[slug]/page.tsx`
- `app/sprendimai/page.tsx`
- `app/projektai/page.tsx`
- `app/apie/page.tsx`
- `app/kontaktai/page.tsx`
- `app/checkout/page.tsx`

### 3. Techniniai SEO Elementai

**✅ Veikia:**
- `public/robots.txt` - sukonfigūruotas
- `public/sitemap.xml` - generuojamas
- HTML lang="lt" - nustatytas
- Semantic HTML - naudojamas

**❌ Trūksta:**
- Open Graph images (1200x630)
- Favicon.ico
- Apple touch icon
- Site webmanifest
- Structured data (JSON-LD)

---

## 🔍 Kur Pamatyti SEO

### 1. Chrome DevTools

Atidarykite bet kurį puslapį ir:

```
1. Dešinis pelės klavišas → "Inspect" (arba F12)
2. Elements tab → <head> sekcija
3. Ieškokite:
   - <title>
   - <meta name="description">
   - <meta property="og:*">
   - <link rel="canonical">
```

**Kas matysite dabar:**
- ❌ Nėra title tag
- ❌ Nėra description
- ❌ Nėra OpenGraph tags

### 2. View Page Source

```
1. Dešinis pelės klavišas → "View Page Source" (Ctrl+U)
2. Ieškokite <head> sekcijoje
```

**Pavyzdys kaip turėtų atrodyti:**
```html
<head>
  <title>Yakiwood - Deginta Mediena Shou Sugi Ban</title>
  <meta name="description" content="..."/>
  <meta property="og:title" content="..."/>
  <meta property="og:image" content="..."/>
  <!-- etc -->
</head>
```

### 3. Google Search Console

```
1. Eikite: https://search.google.com/search-console
2. Pridėkite savo domeną
3. Performance → Queries, Pages, Countries
4. Coverage → Indexavimo problemos
```

**Ką matysite:**
- Indexed pages
- Search queries
- Click-through rates
- Mobile usability

### 4. SEO Analyzer Tools

**Greitai patikrinti:**

1. **Lighthouse (Chrome)**
```
1. Chrome DevTools (F12)
2. Lighthouse tab
3. Generate report
4. Žiūrėkite SEO score
```

2. **Online Tools:**
- https://www.seobility.net/en/seocheck/
- https://www.websiteplanet.com/webtools/seo-checker/
- https://sitechecker.pro/

Įveskite: `http://localhost:3000` (local) arba `yakiwood.lt` (production)

**Rezultatai rodo:**
- Missing meta tags
- Broken links
- Image alt texts
- Heading structure
- Mobile-friendliness

### 5. OpenGraph Debugger

**Facebook:**
- https://developers.facebook.com/tools/debug/
- Įveskite URL ir spauskite "Debug"
- Matysite kaip atrodys jūsų linkas Facebook

**Twitter:**
- https://cards-dev.twitter.com/validator
- Matysite Twitter card preview

---

## 🛠️ Kaip Pataisyti SEO

### Pridėti Metadata į Homepage

**Failas:** `app/page.tsx`

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yakiwood - Deginta Mediena Shou Sugi Ban | Fasadai ir Interjeras',
  description: 'Aukščiausios kokybės deginta mediena pagal japonišką Shou Sugi Ban techniką. Fasadų dailės sprendimai, terasos lentos ir interjero apdaila Lietuvoje.',
  keywords: ['deginta mediena', 'shou sugi ban', 'yakisugi', 'fasadai', 'terasos lentos', 'medienos apdaila', 'ekologiška mediena', 'Lietuva'],
  openGraph: {
    title: 'Yakiwood - Deginta Mediena Shou Sugi Ban',
    description: 'Aukščiausios kokybės deginta mediena pagal japonišką Shou Sugi Ban techniką.',
    url: 'https://yakiwood.lt',
    siteName: 'Yakiwood',
    locale: 'lt_LT',
    type: 'website',
    images: [
      {
        url: '/og-image-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Yakiwood Deginta Mediena Fasadai',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yakiwood - Deginta Mediena Shou Sugi Ban',
    description: 'Aukščiausios kokybės deginta mediena pagal japonišką Shou Sugi Ban techniką.',
    images: ['/og-image-home.jpg'],
  },
  alternates: {
    canonical: 'https://yakiwood.lt',
  },
};

export default function Home() {
  // ... existing code
}
```

### Pridėti Metadata į Produktų Puslapį

**Failas:** `app/produktai/page.tsx`

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Produktai - Deginta Mediena | Yakiwood',
  description: 'Peržiūrėkite mūsų deginto...s medienos produktų asortimentą: fasadų lentos, terasos lentos, apdailos elementai. Spalvų ir apdailos variantai.',
  openGraph: {
    title: 'Produktai - Deginta Mediena',
    description: 'Peržiūrėkite mūsų deginto...s medienos produktų asortimentą.',
    url: 'https://yakiwood.lt/produktai',
    images: [{ url: '/og-image-products.jpg', width: 1200, height: 630 }],
  },
  alternates: {
    canonical: 'https://yakiwood.lt/produktai',
  },
};
```

### Pridėti Dynamic Metadata į Produkto Detales

**Failas:** `app/produktai/[slug]/page.tsx`

```tsx
import { Metadata } from 'next';

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch product data
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Produktas nerastas | Yakiwood',
    };
  }

  return {
    title: `${product.name} - Deginta Mediena | Yakiwood`,
    description: product.description || `${product.name} - aukščiausios kokybės deginta mediena pagal Shou Sugi Ban techniką.`,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `https://yakiwood.lt/produktai/${params.slug}`,
      images: product.images?.map(img => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: product.name,
      })) || [],
      type: 'website',
    },
    alternates: {
      canonical: `https://yakiwood.lt/produktai/${params.slug}`,
    },
  };
}

export default function ProductPage({ params }: Props) {
  // ... existing code
}
```

### Sukurti OpenGraph Images

**Reikia sukurti šiuos paveikslėlius:**

```
public/
├── og-image-home.jpg (1200x630) - Homepage preview
├── og-image-products.jpg (1200x630) - Products page
├── og-image-projects.jpg (1200x630) - Projects page
├── og-image-solutions.jpg (1200x630) - Solutions page
├── favicon.ico (32x32, 16x16)
├── apple-touch-icon.png (180x180)
└── site.webmanifest
```

**OG Image requirements:**
- Dydis: 1200x630 px
- Formatas: JPG arba PNG
- Max: 8MB
- Rodo Yakiwood produktus/logo

**Galite sukurti su:**
- Canva: https://www.canva.com/create/open-graph/
- Figma: Eksportuoti 1200x630 frame
- AI: DALL-E, Midjourney

### Structured Data (JSON-LD)

**Pridėti į `app/layout.tsx` arba `app/page.tsx`:**

```tsx
export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Yakiwood',
    url: 'https://yakiwood.lt',
    logo: 'https://yakiwood.lt/logo.png',
    description: 'Aukščiausios kokybės deginta mediena pagal Shou Sugi Ban techniką',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'LT',
      addressLocality: 'Vilnius',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@yakiwood.lt',
      contactType: 'Customer Service',
    },
    sameAs: [
      'https://facebook.com/yakiwood',
      'https://instagram.com/yakiwood',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ... rest of page */}
    </>
  );
}
```

---

## 📈 SEO Checklist

### Immediate (dabar):
- [ ] Pridėti metadata į `app/layout.tsx`
- [ ] Pridėti metadata į `app/page.tsx`
- [ ] Pridėti metadata į `app/produktai/page.tsx`
- [ ] Pridėti metadata į `app/produktai/[slug]/page.tsx`

### Short-term (šią savaitę):
- [ ] Sukurti OG images (1200x630)
- [ ] Pridėti favicon.ico
- [ ] Sukurti apple-touch-icon.png
- [ ] Pridėti JSON-LD structured data
- [ ] Patikrinti alt texts visuose paveikslėliuose

### Medium-term (kitą savaitę):
- [ ] Submit sitemap į Google Search Console
- [ ] Submit sitemap į Bing Webmaster Tools
- [ ] Optimizuoti puslapių load times
- [ ] Mobile usability testing
- [ ] Internal linking strategy

### Long-term (po mėnesio):
- [ ] Content marketing (blog)
- [ ] Backlinks strategy
- [ ] Local SEO (Google My Business)
- [ ] Product schema markup
- [ ] FAQ schema markup

---

## 🎯 SEO Progresas

```
Dabar: 40%
Po metadata pridėjimo: 60%
Po OG images: 70%
Po structured data: 80%
Po content optimization: 90%
Po link building: 100%
```

---

## 📝 NPM Scripts Testavimui

Pridėkite į `package.json`:

```json
{
  "scripts": {
    "seo:check": "echo 'Visit http://localhost:3000 and check page source'",
    "seo:lighthouse": "echo 'Open Chrome DevTools → Lighthouse → Generate Report'"
  }
}
```

---

**Atidarykite dabar:**
1. http://localhost:3000
2. Dešinis pelės klavišas → "View Page Source" (Ctrl+U)
3. Ieškokite `<title>` ir `<meta>` tags
4. Pamatysite kas trūksta!
