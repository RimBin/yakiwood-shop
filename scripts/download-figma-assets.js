#!/usr/bin/env node
/**
 * Download Figma asset URLs listed in public/assets/figma-manifest.json
 * Saves each as public/assets/<key>.jpg (or .png if content-type suggests)
 */
const fs = require('fs');
const path = require('path');
const manifestPath = path.join(process.cwd(), 'public', 'assets', 'figma-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('Manifest not found at', manifestPath);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const outDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function download(key, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠ Failed ${key}: ${res.status}`);
      return;
    }
    const contentType = res.headers.get('content-type') || '';
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    if (contentType.includes('webp')) ext = '.webp';
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(outDir, `${key}${ext}`);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Saved ${key}${ext}`);
  } catch (e) {
    console.error(`❌ Error downloading ${key}:`, e.message);
  }
}

(async () => {
  console.log('Downloading Figma assets...');
  for (const [key, url] of Object.entries(manifest)) {
    await download(key, url);
  }
  console.log('Done.');
})();
