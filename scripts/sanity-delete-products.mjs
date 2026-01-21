import {createClient} from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eqIndex = line.indexOf('=')
    if (eqIndex === -1) continue

    const key = line.slice(0, eqIndex).trim()
    let value = line.slice(eqIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

// Next.js auto-loads .env.local, but plain `node` does not.
loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env'))

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

function chunk(array, size) {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

function toBaseId(id) {
  return id.startsWith('drafts.') ? id.slice('drafts.'.length) : id
}

const args = new Set(process.argv.slice(2))
const shouldApply = args.has('--yes') || args.has('-y')
const batchSizeArg = [...args].find((a) => a.startsWith('--batch='))
const batchSize = batchSizeArg ? Number(batchSizeArg.slice('--batch='.length)) : 50

if (!Number.isFinite(batchSize) || batchSize < 1 || batchSize > 200) {
  throw new Error('Invalid --batch value. Use 1..200')
}

const projectId = requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID')
const dataset = requireEnv('NEXT_PUBLIC_SANITY_DATASET')
const token = requireEnv('SANITY_API_TOKEN')
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-12-10'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
  perspective: 'raw',
})

const productIds = await client.fetch('*[_type == "product"]{_id}')
const baseIds = Array.from(new Set(productIds.map((d) => toBaseId(d._id)))).sort()

console.log(`Found ${baseIds.length} product document(s) (_type=="product") in dataset "${dataset}".`)

if (baseIds.length === 0) {
  process.exit(0)
}

if (!shouldApply) {
  console.log('Dry run only. Re-run with --yes to DELETE them.')
  console.log('Example: node scripts/sanity-delete-products.mjs --yes')
  process.exit(0)
}

for (const ids of chunk(baseIds, batchSize)) {
  const mutations = []
  for (const id of ids) {
    mutations.push({delete: {id}})
    mutations.push({delete: {id: `drafts.${id}`}})
  }

  await client.mutate(mutations)
  console.log(`Deleted batch: ${ids.length} product(s).`)
}

console.log('Done.')
