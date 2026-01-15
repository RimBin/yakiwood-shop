import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = String(rawLine).trim()
    if (!line || line.startsWith('#')) return
    const eqIndex = line.indexOf('=')
    if (eqIndex <= 0) return

    const key = line.slice(0, eqIndex).trim()
    let value = line.slice(eqIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  })
}

function loadEnv() {
  const root = process.cwd()
  // Make scripts behave like Next dev/build (which reads .env files automatically).
  loadDotEnvFile(path.join(root, '.env.local'))
  loadDotEnvFile(path.join(root, '.env'))
}

function requiredEnv(name, value) {
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing env var: ${name}`)
  }
  return String(value).trim()
}

function toSlug(input) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function finishImageUrl(woodType, colorCode) {
  const wood = woodType === 'larch' ? 'larch' : 'spruce'
  const code = toSlug(colorCode)
  return `/assets/finishes/${wood}/shou-sugi-ban-${wood}-${code}-facade-terrace-cladding.webp`
}

function skuChunk(input) {
  const v = toSlug(String(input || ''))
  return v ? v.toUpperCase() : 'UNKNOWN'
}

function usageSkuCode(usageType) {
  const v = toSlug(String(usageType || ''))
  if (v === 'facade') return 'FAC'
  if (v === 'terrace') return 'TER'
  if (v === 'interior') return 'INT'
  if (v === 'fence') return 'FEN'
  return skuChunk(v)
}

function woodSkuCode(woodType) {
  const v = toSlug(String(woodType || ''))
  if (v === 'spruce') return 'SP'
  if (v === 'larch') return 'LA'
  return skuChunk(v)
}

function profileSkuCode(profileCodeOrLabel) {
  const v = toSlug(String(profileCodeOrLabel || ''))
  if (!v) return 'NOPROFILE'
  if (v.includes('rect') || v.includes('staciakamp')) return 'RECT'
  if (v.includes('rhomb') || v.includes('romb')) return 'RHOM'
  if ((v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) && v.includes('45'))
    return 'HALF45'
  if (v.includes('half') || v.includes('taper') || v.includes('spunto') || v.includes('pus')) return 'HALF'
  return skuChunk(v)
}

function colorSkuCode(colorCodeOrLabel) {
  const v = toSlug(String(colorCodeOrLabel || ''))
  if (!v) return 'NOCOLOR'
  return skuChunk(v)
}

function buildInventorySku({ usageType, woodType, profile, color, widthMm, lengthMm, thicknessMm }) {
  const usage = usageSkuCode(usageType)
  const wood = woodSkuCode(woodType)
  const profileCode = profileSkuCode(profile)
  const colorCode = colorSkuCode(color)
  const width = Number.isFinite(widthMm) && widthMm > 0 ? Math.round(widthMm) : null
  const length = Number.isFinite(lengthMm) && lengthMm > 0 ? Math.round(lengthMm) : null
  const thickness = Number.isFinite(thicknessMm) && thicknessMm > 0 ? Math.round(thicknessMm) : null

  const size = width !== null && length !== null ? `${width}X${length}` : 'NOSIZE'
  const thick = thickness !== null ? `T${thickness}` : null

  return ['YW', usage, wood, profileCode, colorCode, size, thick].filter(Boolean).join('-')
}

async function upsertCatalogOption(supabase, row) {
  const optionType = row.option_type
  const valueMm = typeof row.value_mm === 'number' ? row.value_mm : null
  const valueText = typeof row.value_text === 'string' && row.value_text.trim() ? row.value_text.trim() : null

  let query = supabase.from('catalog_options').select('id').eq('option_type', optionType)
  if (valueMm !== null) query = query.eq('value_mm', valueMm)
  else if (valueText !== null) query = query.ilike('value_text', valueText)
  else throw new Error('Invalid catalog option row: missing value_mm/value_text')

  const { data: existing, error: findError } = await query.maybeSingle()
  if (findError) throw new Error(`Failed to lookup catalog option (${optionType}): ${findError.message}`)

  if (existing?.id) {
    const { error: updateError } = await supabase.from('catalog_options').update(row).eq('id', existing.id)
    if (updateError) throw new Error(`Failed to update catalog option (${optionType}): ${updateError.message}`)
    return existing.id
  }

  const { data: inserted, error: insertError } = await supabase.from('catalog_options').insert(row).select('id').single()
  if (insertError) throw new Error(`Failed to insert catalog option (${optionType}): ${insertError.message}`)
  return inserted.id
}

async function upsertProductBySlug(supabase, row) {
  const slug = row.slug
  const { data: existing, error: findError } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (findError) throw new Error(`Failed to lookup product (${slug}): ${findError.message}`)

  if (existing?.id) {
    const { error: updateError } = await supabase.from('products').update(row).eq('id', existing.id)
    if (updateError) throw new Error(`Failed to update product (${slug}): ${updateError.message}`)
    return existing.id
  }

  const { data: inserted, error: insertError } = await supabase.from('products').insert(row).select('id').single()
  if (insertError) throw new Error(`Failed to insert product (${slug}): ${insertError.message}`)
  return inserted.id
}

async function replaceProductVariants(supabase, productId, variantType, rows) {
  const { error: delErr } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId)
    .eq('variant_type', variantType)

  if (delErr) throw new Error(`Failed to delete existing ${variantType} variants: ${delErr.message}`)
  if (!rows.length) return

  const { error: insErr } = await supabase.from('product_variants').insert(rows)
  if (!insErr) return

  const msg = String(insErr.message || insErr)

  // Older schema may not have label_lt/label_en/value_mm/image_url columns.
  if (
    msg.includes('label_lt') ||
    msg.includes('label_en') ||
    msg.includes('value_mm') ||
    msg.includes('image_url') ||
    msg.includes('schema cache')
  ) {
    const fallback = rows.map((row) => {
      const { label_lt, label_en, value_mm, image_url, ...rest } = row
      return rest
    })
    const { error: retryErr } = await supabase.from('product_variants').insert(fallback)
    if (retryErr) throw new Error(`Failed to insert fallback variants: ${retryErr.message}`)
    return
  }

  throw new Error(`Failed to insert variants: ${msg}`)
}

async function insertInventorySkus(supabase, rows) {
  if (!rows.length) return
  const { error } = await supabase.from('inventory_items').upsert(rows, { onConflict: 'sku', ignoreDuplicates: true })
  if (!error) return

  const msg = String(error.message || error)
  if (msg.includes('inventory_items') && (msg.includes('does not exist') || msg.includes('schema cache'))) {
    console.warn(`Inventory seeding skipped: ${msg}`)
    return
  }
  throw new Error(`Failed to upsert inventory items: ${msg}`)
}

async function main() {
  loadEnv()

  requiredEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  requiredEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const widthOptionsMm = [95, 120, 145]
  const lengthOptionsMm = [3000, 3300, 3600]

  // 1) Ensure catalog options for thickness/width/length exist (used by /api/pricing/quote)
  {
    const rows = [
      {
        option_type: 'thickness',
        value_mm: 20,
        label_lt: '18/20 mm',
        label_en: '18/20 mm',
        sort_order: 0,
        is_active: true,
      },
      {
        option_type: 'thickness',
        value_mm: 28,
        label_lt: '28 mm',
        label_en: '28 mm',
        sort_order: 1,
        is_active: true,
      },
      ...widthOptionsMm.map((mm, idx) => ({
        option_type: 'width_mm',
        value_mm: mm,
        label_lt: `${mm} mm`,
        label_en: `${mm} mm`,
        sort_order: idx,
        is_active: true,
      })),
      ...lengthOptionsMm.map((mm, idx) => ({
        option_type: 'length_mm',
        value_mm: mm,
        label_lt: `${mm} mm`,
        label_en: `${mm} mm`,
        sort_order: idx,
        is_active: true,
      })),
    ]

    for (const row of rows) {
      await upsertCatalogOption(supabase, row)
    }
  }

  // Resolve thickness option ids.
  const thicknessByMm = new Map()
  {
    const { data, error } = await supabase
      .from('catalog_options')
      .select('id,value_mm')
      .eq('option_type', 'thickness')
      .in('value_mm', [20, 28])
      .eq('is_active', true)

    if (error) throw new Error(`Failed to fetch thickness options: ${error.message}`)
    for (const row of data ?? []) {
      thicknessByMm.set(row.value_mm, row.id)
    }
    if (!thicknessByMm.get(20) || !thicknessByMm.get(28)) {
      throw new Error('Thickness options missing after upsert (expected 20 and 28).')
    }
  }

  // 2) Upsert 4 products
  const products = [
    {
      slug: 'degintos-medienos-dailylente-fasadui-egle-natural',
      slug_en: 'shou-sugi-ban-for-facade-spruce-natural',
      category: 'cladding',
      usage_type: 'facade',
      wood_type: 'spruce',
      base_price: 89.0,
      name: 'Shou Sugi Ban eglė fasadui',
      name_en: 'Shou Sugi Ban spruce for facade',
      description: 'Deginta eglė fasadams (Shou Sugi Ban). Kaina skaičiuojama pagal m², priklausomai nuo lentos pločio ir ilgio.',
      description_en: 'Burnt spruce for facades (Shou Sugi Ban). Price is calculated per m² based on board width and length.',
      image_url: finishImageUrl('spruce', 'natural'),
      is_active: true,
    },
    {
      slug: 'degintos-medienos-terasine-lenta-terasai-egle-natural',
      slug_en: 'shou-sugi-ban-for-terrace-spruce-natural',
      category: 'decking',
      usage_type: 'terrace',
      wood_type: 'spruce',
      base_price: 79.0,
      name: 'Shou Sugi Ban eglė terasai',
      name_en: 'Shou Sugi Ban spruce for terrace',
      description: 'Deginta eglė terasoms (Shou Sugi Ban). Kaina skaičiuojama pagal m², priklausomai nuo lentos pločio ir ilgio.',
      description_en: 'Burnt spruce for terraces (Shou Sugi Ban). Price is calculated per m² based on board width and length.',
      image_url: finishImageUrl('spruce', 'natural'),
      is_active: true,
    },
    {
      slug: 'degintos-medienos-dailylente-fasadui-maumedis-natural',
      slug_en: 'shou-sugi-ban-for-facade-larch-natural',
      category: 'cladding',
      usage_type: 'facade',
      wood_type: 'larch',
      base_price: 89.0,
      name: 'Shou Sugi Ban maumedis fasadui',
      name_en: 'Shou Sugi Ban larch for facade',
      description: 'Degintas maumedis fasadams (Shou Sugi Ban). Kaina skaičiuojama pagal m², priklausomai nuo lentos pločio ir ilgio.',
      description_en: 'Burnt larch for facades (Shou Sugi Ban). Price is calculated per m² based on board width and length.',
      image_url: finishImageUrl('larch', 'natural'),
      is_active: true,
    },
    {
      slug: 'degintos-medienos-terasine-lenta-terasai-maumedis-natural',
      slug_en: 'shou-sugi-ban-for-terrace-larch-natural',
      category: 'decking',
      usage_type: 'terrace',
      wood_type: 'larch',
      base_price: 79.0,
      name: 'Shou Sugi Ban maumedis terasai',
      name_en: 'Shou Sugi Ban larch for terrace',
      description: 'Degintas maumedis terasoms (Shou Sugi Ban). Kaina skaičiuojama pagal m², priklausomai nuo lentos pločio ir ilgio.',
      description_en: 'Burnt larch for terraces (Shou Sugi Ban). Price is calculated per m² based on board width and length.',
      image_url: finishImageUrl('larch', 'natural'),
      is_active: true,
    },
  ]

  const idBySlug = new Map()
  for (const p of products) {
    const id = await upsertProductBySlug(supabase, p)
    idBySlug.set(p.slug, id)
  }

  // 3) Ensure color variants exist per product (price impact = 0)
  const { data: colors, error: colorsError } = await supabase
    .from('catalog_options')
    .select('value_text,label_lt,label_en,hex_color,sort_order')
    .eq('option_type', 'color')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (colorsError) throw new Error(`Failed to fetch catalog colors: ${colorsError.message}`)

  for (const p of products) {
    const productId = idBySlug.get(p.slug)

    const rows = (colors ?? [])
      .filter((c) => typeof c.value_text === 'string' && c.value_text.trim())
      .map((c) => {
        const code = c.value_text.trim()
        return {
          product_id: productId,
          name: code,
          variant_type: 'color',
          label_lt: c.label_lt ?? null,
          label_en: c.label_en ?? null,
          hex_color: c.hex_color ?? null,
          price_adjustment: 0,
          is_available: true,
          texture_url: null,
        }
      })

    await replaceProductVariants(supabase, productId, 'color', rows)
  }

  // 3b) Ensure profile variants exist per product.
  // Terrace: only rectangle. Facade: the remaining three (no rectangle).
  const profileByUsage = {
    terrace: [
      {
        code: 'rectangle',
        label_lt: 'Stačiakampis',
        label_en: 'Rectangle',
      },
    ],
    facade: [
      {
        code: 'half-taper-45',
        label_lt: 'Pusiau spuntuotas 45°',
        label_en: 'Half-taper 45°',
      },
      {
        code: 'half-taper',
        label_lt: 'Pusiau spuntuotas',
        label_en: 'Half-taper',
      },
      {
        code: 'rhombus',
        label_lt: 'Rombas',
        label_en: 'Rhombus',
      },
    ],
  }

  for (const p of products) {
    const productId = idBySlug.get(p.slug)
    const usageType = p.usage_type === 'terrace' ? 'terrace' : 'facade'
    const profiles = profileByUsage[usageType] || []

    const rows = profiles.map((profile) => ({
      product_id: productId,
      name: profile.code,
      variant_type: 'profile',
      label_lt: profile.label_lt,
      label_en: profile.label_en,
      hex_color: null,
      price_adjustment: 0,
      is_available: true,
      texture_url: null,
    }))

    await replaceProductVariants(supabase, productId, 'profile', rows)
  }

  // 4) Create configuration pricing matrix rows for all width×length combinations
  for (const p of products) {
    const productId = idBySlug.get(p.slug)
    const pricePerM2 = p.base_price

    const { error: delErr } = await supabase
      .from('product_configuration_prices')
      .delete()
      .eq('product_id', productId)

    if (delErr) throw new Error(`Failed to clear pricing rows for ${p.slug}: ${delErr.message}`)

    const rows = []
    for (const width of widthOptionsMm) {
      for (const length of lengthOptionsMm) {
        rows.push({
          product_id: productId,
          width_mm: width,
          length_mm: length,
          unit_price_per_m2: pricePerM2,
          is_active: true,
          profile_variant_id: null,
          color_variant_id: null,
        })
      }
    }

    // Pricing table may not exist in older schemas. If insert fails due to missing table/columns, skip with a warning.
    const { error: insErr } = await supabase.from('product_configuration_prices').insert(rows)
    if (insErr) {
      const msg = String(insErr.message || insErr)
      if (msg.includes('schema cache') || msg.includes('product_configuration_prices')) {
        console.warn(`Pricing rows skipped for ${p.slug}: ${msg}`)
      } else {
        throw new Error(`Failed to insert pricing rows for ${p.slug}: ${msg}`)
      }
    }
  }

  // 5) Create inventory SKUs for every (profile x color x width x length) configuration.
  // These become separate stock items in `inventory_items`.
  const inventoryRows = []

  const colorCodes = (colors ?? [])
    .filter((c) => typeof c.value_text === 'string' && c.value_text.trim())
    .map((c) => c.value_text.trim())

  for (const p of products) {
    const productId = idBySlug.get(p.slug)
    const usageType = p.usage_type === 'terrace' ? 'terrace' : 'facade'
    const thicknessMm = usageType === 'terrace' ? 28 : 20
    const woodType = p.wood_type

    const profiles = profileByUsage[usageType] || []

    for (const profile of profiles) {
      for (const colorCode of colorCodes) {
        for (const width of widthOptionsMm) {
          for (const length of lengthOptionsMm) {
            inventoryRows.push({
              product_id: productId,
              variant_id: null,
              sku: buildInventorySku({
                usageType,
                woodType,
                profile: profile.code,
                color: colorCode,
                widthMm: width,
                lengthMm: length,
                thicknessMm,
              }),
              quantity_available: 0,
              reorder_point: 10,
              reorder_quantity: 50,
              location: null,
            })
          }
        }
      }
    }
  }

  const CHUNK = 250
  for (let i = 0; i < inventoryRows.length; i += CHUNK) {
    await insertInventorySkus(supabase, inventoryRows.slice(i, i + CHUNK))
  }

  console.log('Seeded fixed products + pricing successfully.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
