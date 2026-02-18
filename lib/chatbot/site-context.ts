import { fetchProducts, type Product } from '@/lib/products.supabase'
import {
  formatDeliverySummaryEn,
  formatDeliverySummaryLt,
} from '@/lib/shipping/policy'
import { normalizeText, tokenizeText } from './utils'

function normalize(value: string): string {
  return normalizeText(value)
}

function tokenize(value: string): string[] {
  return tokenizeText(value, 4)
}

function uniqStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const s = String(v || '').trim()
    if (!s) continue
    const k = s.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(s)
  }
  return out
}

function formatPriceEur(value: number): string {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  // No cents unless needed
  const rounded = Math.round(n * 100) / 100
  const hasCents = Math.abs(rounded - Math.round(rounded)) > 0.0001
  return hasCents ? `${rounded.toFixed(2)}€` : `${Math.round(rounded)}€`
}

function productDisplayName(p: Product, locale: 'lt' | 'en'): string {
  if (locale === 'en' && p.nameEn) return p.nameEn
  return p.name
}

function parseStockItemSlug(slug: string): { baseSlug: string; profile: string; color: string; size: string } | null {
  const parts = String(slug || '').split('--')
  if (parts.length < 4) return null
  const [baseSlug, profile, color, size] = parts
  if (!baseSlug || !profile || !color || !size) return null
  return { baseSlug, profile, color, size }
}

function parseSizeToken(size: string | undefined | null): { widthMm: number; lengthMm: number } | null {
  if (!size) return null
  const match = String(size).trim().match(/(\d+)\s*[x×]\s*(\d+)/i)
  if (!match) return null
  const widthMm = Number(match[1])
  const lengthMm = Number(match[2])
  if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm) || widthMm <= 0 || lengthMm <= 0) return null
  return { widthMm, lengthMm }
}

function toLtWoodGenitive(value: string): string {
  const normalized = normalize(value)
  if (normalized === 'egle') return 'eglės'
  if (normalized === 'maumedis') return 'maumedžio'
  return value.trim().toLowerCase()
}

function toLtProductGenitive(value: string): string {
  const normalized = normalize(value)
  if (normalized === 'fasadine dailylente') return 'fasadinės dailylentės'
  if (normalized === 'terasine lenta') return 'terasinės lentos'
  return value.trim().toLowerCase()
}

function buildLtProductPriceQuestion(name: string): string {
  const trimmed = String(name || '').trim()
  if (!trimmed) return 'Kokia produkto kaina?'

  const parts = trimmed
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 2) {
    const product = toLtProductGenitive(parts[0]!)
    const wood = toLtWoodGenitive(parts[1]!)
    return `Kokia ${wood} ${product} kaina?`
  }

  return `Kokia ${trimmed.toLowerCase()} kaina?`
}

export function productPathForLocale(p: Product, locale: 'lt' | 'en'): string {
  const slug = locale === 'en' ? (p.slugEn || p.slug) : p.slug
  const basePath = locale === 'en' ? `/products/${slug}` : `/produktai/${slug}`

  const query = new URLSearchParams()

  const stock = parseStockItemSlug(slug)
  if (stock) {
    const size = parseSizeToken(stock.size)
    if (size) {
      query.set('w', String(size.widthMm))
      query.set('l', String(size.lengthMm))
    }
    query.set('ct', normalize(stock.color))
    query.set('ft', normalize(stock.profile))
  }

  const firstColor = Array.isArray(p.colors) ? p.colors[0] : null
  if (firstColor?.id) query.set('c', firstColor.id)
  if (firstColor?.name && !query.get('ct')) query.set('ct', normalize(firstColor.name))

  const firstProfile = Array.isArray(p.profiles) ? p.profiles[0] : null
  if (firstProfile?.id) query.set('f', firstProfile.id)
  if ((firstProfile?.code || firstProfile?.name) && !query.get('ft')) {
    query.set('ft', normalize(String(firstProfile.code || firstProfile.name)))
  }

  if (!query.get('w')) query.set('w', '95')
  if (!query.get('l')) query.set('l', '3000')
  if (!query.get('t')) {
    query.set('t', String(String(p.category || '').toLowerCase() === 'terrace' ? 28 : 20))
  }

  const qs = query.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function matchProductFromMessage(args: {
  locale: 'lt' | 'en'
  message: string
  products: Product[]
}): Product | null {
  const msg = normalize(args.message)
  if (!msg) return null

  const candidates = args.products.slice(0, 60)
  const msgTokens = new Set(tokenize(args.message))

  function scoreProduct(p: Product): number {
    const nameTokens = tokenize(productDisplayName(p, args.locale))
    const slugTokens = tokenize(p.slug)
    const slugEnTokens = tokenize(p.slugEn || '')
    const all = [...nameTokens, ...slugTokens, ...slugEnTokens]
    let score = 0
    for (const t of all) {
      if (msgTokens.has(t)) score += 1
    }
    const n = normalize(productDisplayName(p, args.locale))
    if (n.length >= 6 && msg.includes(n)) score += 3
    return score
  }

  let best: { p: Product; score: number } | null = null
  for (const p of candidates) {
    const score = scoreProduct(p)
    if (score <= 0) continue
    if (!best || score > best.score) best = { p, score }
  }

  if (!best) return null
  if (best.score >= 2) return best.p
  // If only a weak match, require that the user explicitly asks about price/delivery/etc.
  const looksLikeQuery =
    msg.includes('kain') ||
    msg.includes('price') ||
    msg.includes('cost') ||
    msg.includes('€') ||
    msg.includes('pristat') ||
    msg.includes('delivery') ||
    msg.includes('shipping')
  return looksLikeQuery ? best.p : null
}

export async function getLiveCatalog(locale: 'lt' | 'en') {
  const products = await fetchProducts()
  const active = products.filter((p) => p && p.id && p.slug)
  const nameById = (p: Product) => productDisplayName(p, locale)
  const sorted = [...active].sort((a, b) => nameById(a).localeCompare(nameById(b)))
  return sorted
}

export function buildCatalogContextBlock(products: Product[], locale: 'lt' | 'en'): string {
  if (!products.length) return ''

  const prices = products
    .map((p) => (typeof p.salePrice === 'number' && p.salePrice > 0 ? p.salePrice : p.price))
    .filter((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)

  const min = prices.length ? Math.min(...prices) : null
  const max = prices.length ? Math.max(...prices) : null

  const header =
    locale === 'en'
      ? 'Live catalog (keep prices up-to-date):'
      : 'Aktualus katalogas (kainos iš svetainės):'

  const lines: string[] = [header]

  if (min !== null && max !== null) {
    lines.push(
      locale === 'en'
        ? `- Price range: ${formatPriceEur(min)} – ${formatPriceEur(max)}`
        : `- Kainų rėžis: ${formatPriceEur(min)} – ${formatPriceEur(max)}`
    )
  }

  // Keep short to avoid token bloat
  const top = products.slice(0, 12)
  for (const p of top) {
    const name = productDisplayName(p, locale)
    const effective = typeof p.salePrice === 'number' && p.salePrice > 0 ? p.salePrice : p.price
    const sale = typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price
    const suffix = sale ? ` (sale: ${formatPriceEur(p.salePrice!)})` : ''
    lines.push(`- ${name} — ${formatPriceEur(effective)}${suffix} — ${productPathForLocale(p, locale)}`)
  }

  return lines.join('\n')
}

export function buildDeliveryContextBlock(locale: 'lt' | 'en'): string {
  const header = locale === 'en' ? 'Delivery (site policy):' : 'Pristatymas (pagal svetainę):'
  const body = locale === 'en' ? formatDeliverySummaryEn() : formatDeliverySummaryLt()
  return `${header}\n- ${body}`
}

export function buildDynamicSuggestions(products: Product[], locale: 'lt' | 'en'): string[] {
  const base =
    locale === 'en'
      ? [
          'Show products',
          'Delivery price and timeline',
          'Payment methods',
          'Returns and warranty',
          'How do I place an order?',
          'Can you help me choose a product?',
        ]
      : [
          'Parodyk produktus',
          'Pristatymo kaina ir terminas',
          'Apmokėjimo būdai',
          'Grąžinimas ir garantija',
          'Kaip pateikti užsakymą?',
          'Padėkite išsirinkti produktą',
        ]

  const productQs = products.slice(0, 6).map((p) => {
    const name = productDisplayName(p, locale)
    return locale === 'en' ? `Price of ${name}` : buildLtProductPriceQuestion(name)
  })

  return uniqStrings([...productQs, ...base]).slice(0, 10)
}

export function tryReplyWithLiveSiteData(args: {
  locale: 'lt' | 'en'
  message: string
  products: Product[]
}): string | null {
  const msg = normalize(args.message)
  if (!msg) return null

  const isProducts =
    msg.includes('parodyk produkt') ||
    msg.includes('rodyk produkt') ||
    (msg.includes('produkt') && (msg.includes('saras') || msg.includes('katalog') || msg.includes('parodyk') || msg.includes('rodyk'))) ||
    msg.includes('show products') ||
    msg.includes('product list') ||
    msg.includes('catalog')

  const isPayment =
    msg.includes('apmok') ||
    msg.includes('atsiskaity') ||
    msg.includes('payment') ||
    msg.includes('stripe') ||
    msg.includes('paypal') ||
    msg.includes('apple pay') ||
    msg.includes('google pay') ||
    msg.includes('wallet') ||
    msg.includes('bank')

  const isReturns =
    msg.includes('grazin') ||
    msg.includes('grąžin') ||
    msg.includes('refund') ||
    msg.includes('return') ||
    msg.includes('warranty') ||
    msg.includes('garant')

  const isCart =
    msg.includes('krepsel') ||
    msg.includes('krepšel') ||
    msg.includes('cart') ||
    msg.includes('checkout')

  const isDelivery =
    msg.includes('pristat') ||
    msg.includes('siunt') ||
    msg.includes('kurjer') ||
    msg.includes('shipping') ||
    msg.includes('delivery')

  if (isDelivery) {
    return args.locale === 'en' ? formatDeliverySummaryEn() : formatDeliverySummaryLt()
  }

  if (isProducts) {
    const list = args.products.slice(0, 8)
    if (!list.length) {
      return args.locale === 'en'
        ? 'Open the catalog: /products'
        : 'Atidarykite katalogą: /produktai'
    }

    const lines = list.map((p) => {
      const name = productDisplayName(p, args.locale)
      const hasSale = typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price
      const effective = hasSale ? p.salePrice! : p.price
      const suffix = hasSale ? (args.locale === 'en' ? ` (was ${formatPriceEur(p.price)})` : ` (buvo ${formatPriceEur(p.price)})`) : ''
      return `- ${name} — ${formatPriceEur(effective)}${suffix} — ${productPathForLocale(p, args.locale)}`
    })

    if (args.locale === 'en') {
      return `Here are some products (live catalog):\n${lines.join('\n')}\n\nOpen all: /products`
    }

    return `Štai keli produktai (iš katalogo):\n${lines.join('\n')}\n\nVisi produktai: /produktai`
  }

  if (isPayment) {
    if (args.locale === 'en') {
      return 'Payment methods (UK): card via Stripe (incl. Apple Pay / Google Pay where supported) and PayPal (when available). You can choose the payment method at checkout. More: /policies'
    }
    return 'Apmokėjimas: kortele per Stripe (kai palaikoma – Apple Pay / Google Pay) ir, kai aktyvuota, PayPal. Mokėjimo būdą pasirinksite atsiskaitymo metu. Daugiau: /policies'
  }

  if (isReturns) {
    if (args.locale === 'en') {
      return 'Returns: 30-day return policy for unused products in original packaging. Custom/cut-to-size items are non-refundable unless defective. Details: /policies'
    }
    return 'Grąžinimas: per 30 dienų galite grąžinti nenaudotas prekes originalioje pakuotėje. Nestandartinės ar pagal matmenis pagamintos prekės negrąžinamos, nebent nustatomas defektas. Detalės: /policies'
  }

  if (isCart) {
    if (args.locale === 'en') {
      return 'Cart: add products from the catalog, adjust quantities, then continue to /checkout to pay and complete the order. Delivery cost is calculated during checkout.'
    }
    return 'Kaip pateikti užsakymą: įsidėkite prekes į krepšelį, pakoreguokite kiekius ir tęskite į /checkout. Ten matysite galutinę sumą, pristatymo kainą ir galėsite saugiai apmokėti.'
  }

  const isPrice = msg.includes('kain') || msg.includes('price') || msg.includes('cost') || msg.includes('€')

  const matched = matchProductFromMessage({ locale: args.locale, message: args.message, products: args.products })
  if (matched && isPrice) {
    const p = matched
    const link = productPathForLocale(p, args.locale)
    const hasSale = typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price
    const inStock = typeof p.inStock === 'boolean' ? p.inStock : null

    const priceLine = hasSale
      ? args.locale === 'en'
        ? `Price: ${formatPriceEur(p.salePrice!)} (was ${formatPriceEur(p.price)}).`
        : `Kaina: ${formatPriceEur(p.salePrice!)} (buvo ${formatPriceEur(p.price)}).`
      : args.locale === 'en'
        ? `Price: ${formatPriceEur(p.price)}.`
        : `Kaina: ${formatPriceEur(p.price)}.`

    const stockLine =
      inStock === null
        ? ''
        : args.locale === 'en'
          ? inStock
            ? 'In stock.'
            : 'Currently out of stock.'
          : inStock
            ? 'Turime sandėlyje.'
            : 'Šiuo metu neturime sandėlyje.'

    if (args.locale === 'en') {
      return `${productDisplayName(p, args.locale)}. ${priceLine} ${stockLine} Link: ${link}`.trim()
    }

    return `${productDisplayName(p, args.locale)}. ${priceLine} ${stockLine} Nuoroda: ${link}`.trim()
  }

  if (isPrice) {
    const prices = args.products
      .map((p) => (typeof p.salePrice === 'number' && p.salePrice > 0 ? p.salePrice : p.price))
      .filter((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)

    const min = prices.length ? Math.min(...prices) : null
    const max = prices.length ? Math.max(...prices) : null

    const top = args.products.slice(0, 6)
    const list = top
      .map((p) => {
        const name = productDisplayName(p, args.locale)
        const hasSale = typeof p.salePrice === 'number' && p.salePrice > 0 && p.salePrice < p.price
        const effective = hasSale ? p.salePrice! : p.price
        return `${name} — ${formatPriceEur(effective)}`
      })
      .join(' | ')

    if (args.locale === 'en') {
      const range = min !== null && max !== null ? `${formatPriceEur(min)}–${formatPriceEur(max)}` : '—'
      return `Catalog prices: ${range}. Examples: ${list}. Tell me the product name for an exact price, or open /products.`
    }

    const range = min !== null && max !== null ? `${formatPriceEur(min)}–${formatPriceEur(max)}` : '—'
    return `Kainos kataloge: ${range}. Pvz.: ${list}. Parašykite produkto pavadinimą tiksliam atsakymui, arba atsidarykite /produktai.`
  }

  return null
}
