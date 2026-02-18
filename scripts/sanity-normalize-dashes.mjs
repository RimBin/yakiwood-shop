#!/usr/bin/env node

import {createClient} from '@sanity/client'
import fs from 'node:fs'
import path from 'node:path'

const EN_DASH = '\u2013'
const EM_DASH = '\u2014'

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

function parseArgs(argv) {
  const args = new Set(argv)
  const getArgValue = (name) => {
    const entry = [...args].find((a) => a.startsWith(`${name}=`))
    return entry ? entry.slice(name.length + 1) : null
  }

  const typesRaw = getArgValue('--types')
  const batchRaw = getArgValue('--batch')

  const targetTypes = typesRaw
    ? typesRaw.split(',').map((v) => v.trim()).filter(Boolean)
    : ['product', 'post', 'project', 'page', 'news']

  const batchSize = batchRaw ? Number(batchRaw) : 50
  if (!Number.isFinite(batchSize) || batchSize < 1 || batchSize > 200) {
    throw new Error('Invalid --batch value. Use 1..200')
  }

  return {
    write: args.has('--write'),
    verbose: args.has('--verbose'),
    targetTypes,
    batchSize,
  }
}

function normalizeString(value) {
  const enCount = value.split(EN_DASH).length - 1
  const emCount = value.split(EM_DASH).length - 1
  if (enCount === 0 && emCount === 0) {
    return {value, enCount: 0, emCount: 0, changed: false}
  }

  const normalized = value.replaceAll(EN_DASH, '-').replaceAll(EM_DASH, '-')
  return {
    value: normalized,
    enCount,
    emCount,
    changed: normalized !== value,
  }
}

function normalizeNode(node) {
  if (typeof node === 'string') return normalizeString(node)

  if (Array.isArray(node)) {
    let changed = false
    let enCount = 0
    let emCount = 0

    const normalized = node.map((item) => {
      const next = normalizeNode(item)
      changed = changed || next.changed
      enCount += next.enCount
      emCount += next.emCount
      return next.value
    })

    return {value: changed ? normalized : node, changed, enCount, emCount}
  }

  if (!node || typeof node !== 'object') {
    return {value: node, changed: false, enCount: 0, emCount: 0}
  }

  let changed = false
  let enCount = 0
  let emCount = 0
  const output = {}

  for (const [key, value] of Object.entries(node)) {
    if (key === '_id' || key === '_rev' || key === '_createdAt' || key === '_updatedAt' || key === '_type') {
      output[key] = value
      continue
    }

    const next = normalizeNode(value)
    output[key] = next.value
    changed = changed || next.changed
    enCount += next.enCount
    emCount += next.emCount
  }

  return {value: changed ? output : node, changed, enCount, emCount}
}

function getPatchPayload(document) {
  const payload = {}
  for (const [key, value] of Object.entries(document)) {
    if (key === '_id' || key === '_rev' || key === '_createdAt' || key === '_updatedAt' || key === '_type') continue
    payload[key] = value
  }
  return payload
}

async function main() {
  loadEnvFile(path.join(process.cwd(), '.env.local'))
  loadEnvFile(path.join(process.cwd(), '.env'))

  const options = parseArgs(process.argv.slice(2))

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

  const documents = await client.fetch('*[_type in $types]{...}', {types: options.targetTypes})

  let scanned = 0
  let changedDocs = 0
  let replacedEn = 0
  let replacedEm = 0
  const mutations = []

  for (const document of documents) {
    scanned += 1
    const normalized = normalizeNode(document)
    if (!normalized.changed) continue

    changedDocs += 1
    replacedEn += normalized.enCount
    replacedEm += normalized.emCount

    if (options.verbose) {
      console.log(`[sanity-normalize-dashes] changed: ${document._id} (${document._type})`)
    }

    if (options.write) {
      mutations.push({
        patch: {
          id: document._id,
          set: getPatchPayload(normalized.value),
        },
      })
    }
  }

  console.log(`[sanity-normalize-dashes] mode: ${options.write ? 'WRITE' : 'DRY RUN'}`)
  console.log(`[sanity-normalize-dashes] target types: ${options.targetTypes.join(', ')}`)
  console.log(`[sanity-normalize-dashes] scanned documents: ${scanned}`)
  console.log(`[sanity-normalize-dashes] changed documents: ${changedDocs}`)
  console.log(`[sanity-normalize-dashes] en dash replacements (-): ${replacedEn}`)
  console.log(`[sanity-normalize-dashes] em dash replacements (-): ${replacedEm}`)

  if (!options.write || mutations.length === 0) return

  const batches = chunk(mutations, options.batchSize)
  for (let index = 0; index < batches.length; index += 1) {
    await client.mutate(batches[index])
    console.log(`[sanity-normalize-dashes] applied batch ${index + 1}/${batches.length} (${batches[index].length} mutations)`)
  }
}

main().catch((error) => {
  console.error('[sanity-normalize-dashes] failed:', error)
  process.exit(1)
})
