import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const ROOT = process.cwd();

async function exists(relPath) {
  try {
    await fs.access(path.join(ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

async function convertPngToWebp(relIn, relOut, { quality }) {
  const absIn = path.join(ROOT, relIn);
  const absOut = path.join(ROOT, relOut);

  if (!(await exists(relIn))) {
    throw new Error(`Missing input: ${relIn}`);
  }

  await fs.mkdir(path.dirname(absOut), { recursive: true });

  const image = sharp(absIn);
  const meta = await image.metadata();

  await image.webp({ quality, effort: 5 }).toFile(absOut);

  const outStat = await fs.stat(absOut);
  // eslint-disable-next-line no-console
  console.log(`${relIn} -> ${relOut} (${meta.width}x${meta.height}) bytes=${outStat.size}`);
}

await convertPngToWebp('public/images/hero/Vector.png', 'public/images/hero/Vector.webp', {
  quality: 80,
});

await convertPngToWebp(
  'public/images/hero/4b7525119bfe28d75ceb0720e002c38c77eaf8d6.png',
  'public/images/hero/4b7525119bfe28d75ceb0720e002c38c77eaf8d6.webp',
  { quality: 82 },
);
