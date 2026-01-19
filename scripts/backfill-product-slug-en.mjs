import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'
import path from 'node:path'

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
  loadDotEnvFile(path.join(root, '.env.local'))
  loadDotEnvFile(path.join(root, '.env'))
}

function requiredEnv(name, value) {
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing env var: ${name}`)
  }
  return String(value).trim()
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildEnProductName(usageType, woodType) {
  const usage = String(usageType || '').trim().toLowerCase() === 'terrace' ? 'Terrace board' : 'Facade cladding'
  const wood = String(woodType || '').trim().toLowerCase() === 'larch' ? 'Larch' : 'Spruce'
  return `${usage} / ${wood}`
}

function normalizeUsageType(value) {
  const raw = String(value || '').trim().toLowerCase()
  if (!raw) return null
  if (raw === 'facade' || raw === 'terrace') return raw
  if (raw.includes('facade') || raw.includes('fasad')) return 'facade'
  if (raw.includes('terrace') || raw.includes('teras') || raw.includes('deck')) return 'terrace'
  return null
}

const FINISH_TOKENS = new Set([
  'natural',
  'black',
  'silver',
  'graphite',
  'latte',
  'carbon',
  'carbon-light',
  'carbon-dark',
  'brown',
  'dark-brown',
])

const LT_SLUG_HINTS = [
  'degintos',
  'deginta',
  'medienos',
  'dailylente',
  'fasadui',
  'terasine',
  'lenta',
  'terasai',
  'egle',
  'maumedis',
]

function looksLithuanianSlug(slug) {
  const s = String(slug || '').toLowerCase()
  return LT_SLUG_HINTS.some((h) => s.includes(h))
}

function extractFinishTokenFromSlug(slug) {
  const s = String(slug || '').trim().toLowerCase()
  if (!s) return null

  const withoutQuery = s.split('?')[0].split('#')[0]

  // If it's a stock-item slug, finish is usually in the base portion.
  const base = withoutQuery.includes('--') ? withoutQuery.split('--')[0] : withoutQuery

  const parts = base.split('-').filter(Boolean)
  if (parts.length === 0) return null
  const last = parts[parts.length - 1]
  return FINISH_TOKENS.has(last) ? last : null
}

function parseStockItemSlug(slug) {
  const parts = String(slug || '').split('--')
  if (parts.length < 4) return null
  const [baseSlug, profile, color, size] = parts
  if (!baseSlug || !profile || !color || !size) return null
  return { baseSlug, profile, color, size }
}

function buildStockItemSlug(baseSlug, profile, color, size) {
  return `${baseSlug}--${slugify(profile)}--${slugify(color)}--${String(size).trim()}`
}

async function main() {
  loadEnv()

  const SUPABASE_URL = requiredEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL)
  const SERVICE_KEY = requiredEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

  const { data: rows, error } = await supabase
    .from('products')
    .select('id,slug,slug_en,category,wood_type,name,name_en')
    .order('created_at', { ascending: true })

  if (error) throw error

  const bySlugEn = new Map()
  for (const r of rows || []) {
    if (r.slug_en) bySlugEn.set(String(r.slug_en), String(r.id))
  }

  let considered = 0
  let updated = 0
  let skipped = 0

  for (const row of rows || []) {
    const id = String(row.id)
    const slug = String(row.slug || '')
    const slugEn = row.slug_en == null ? null : String(row.slug_en)

    // Only update if slug_en is missing or was backfilled as slug (and the slug looks Lithuanian).
    const needsUpdate = !slugEn || slugEn === slug
    if (!needsUpdate) {
      skipped++
      continue
    }

    if (!looksLithuanianSlug(slug)) {
      skipped++
      continue
    }

    considered++

    const usageType = normalizeUsageType(row.category) ?? normalizeUsageType(row.name_en) ?? normalizeUsageType(row.name) ?? 'facade'
    const woodType = row.wood_type

    const finish = extractFinishTokenFromSlug(slug)

    const baseCandidate = slugify(buildEnProductName(usageType, woodType))
    const withFinish = finish ? `${baseCandidate}-${finish}` : baseCandidate

    let nextSlugEn = withFinish

    // If this row is a stock-item slug, keep the stock-item structure.
    const parsed = parseStockItemSlug(slug)
    if (parsed) {
      nextSlugEn = buildStockItemSlug(withFinish, parsed.profile, parsed.color, parsed.size)
    }

    // Ensure uniqueness
    const existingOwner = bySlugEn.get(nextSlugEn)
    if (existingOwner && existingOwner !== id) {
      nextSlugEn = `${nextSlugEn}-${id.slice(0, 6)}`
    }

    // No-op check
    if (slugEn === nextSlugEn) {
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ slug_en: nextSlugEn })
      .eq('id', id)

    if (updateError) throw updateError

    bySlugEn.set(nextSlugEn, id)
    updated++
  }

  console.log(`Backfill complete. Considered=${considered} Updated=${updated} Skipped=${skipped} Total=${(rows || []).length}`)
  console.log('Tip: restart dev server to see URL changes.')
}

main().catch((err) => {
  console.error(String(err?.message || err))
  process.exit(1)
})
