#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()

const allowedExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.yml',
  '.yaml',
])

const excludedDirNames = new Set([
  '.git',
  '.next',
  'node_modules',
  'playwright-report',
  'test-results',
])

const excludedPathFragments = [
  `${path.sep}lib${path.sep}email${path.sep}`,
  `${path.sep}lib${path.sep}invoice${path.sep}`,
  `${path.sep}lib${path.sep}chatbot${path.sep}`,
]

const isDryRun = process.argv.includes('--dry-run')
const EN_DASH = '\u2013'
const EM_DASH = '\u2014'

async function walk(dirPath, fileList = []) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      if (excludedDirNames.has(entry.name)) continue
      if (excludedPathFragments.some((fragment) => fullPath.includes(fragment))) continue
      await walk(fullPath, fileList)
      continue
    }

    if (!entry.isFile()) continue
    const ext = path.extname(entry.name).toLowerCase()
    if (!allowedExtensions.has(ext)) continue
    if (excludedPathFragments.some((fragment) => fullPath.includes(fragment))) continue

    fileList.push(fullPath)
  }

  return fileList
}

function countMatches(input, needle) {
  return input.split(needle).length - 1
}

async function main() {
  const files = await walk(rootDir)

  let changedFiles = 0
  let replacedEnDash = 0
  let replacedEmDash = 0

  for (const filePath of files) {
    const original = await fs.readFile(filePath, 'utf8')
    const enDashCount = countMatches(original, EN_DASH)
    const emDashCount = countMatches(original, EM_DASH)

    if (enDashCount === 0 && emDashCount === 0) continue

    const updated = original.replaceAll(EN_DASH, '-').replaceAll(EM_DASH, '-')
    if (updated === original) continue

    changedFiles += 1
    replacedEnDash += enDashCount
    replacedEmDash += emDashCount

    if (!isDryRun) {
      await fs.writeFile(filePath, updated, 'utf8')
    }
  }

  const mode = isDryRun ? 'DRY RUN' : 'WRITE'
  console.log(`[normalize-dashes-repo] ${mode}`)
  console.log(`[normalize-dashes-repo] changed files: ${changedFiles}`)
  console.log(`[normalize-dashes-repo] en dash replacements (-): ${replacedEnDash}`)
  console.log(`[normalize-dashes-repo] em dash replacements (-): ${replacedEmDash}`)
}

main().catch((error) => {
  console.error('[normalize-dashes-repo] failed:', error)
  process.exit(1)
})
