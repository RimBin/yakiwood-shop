const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

function ensureBuildIdFile() {
  const nextDir = path.join(process.cwd(), '.next');
  const buildIdPath = path.join(nextDir, 'BUILD_ID');

  if (fs.existsSync(buildIdPath)) return;

  const staticDir = path.join(nextDir, 'static');
  if (!fs.existsSync(staticDir)) return;

  const candidates = fs
    .readdirSync(staticDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== 'chunks' && name !== 'media');

  if (candidates.length !== 1) return;

  fs.writeFileSync(buildIdPath, `${candidates[0]}\n`, 'utf8');
}

async function main() {
  const userArgs = process.argv.slice(2);

  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!fs.existsSync(nextBin)) {
    console.error(`Next.js binary not found at ${nextBin}`);
    console.error('Run `npm install` first.');
    process.exitCode = 1;
    return;
  }

  // Turbopack cache persistence can be flaky on Windows (SST/compaction errors).
  // Force Webpack-based build unless the user explicitly overrides.
  const env = { ...process.env, NEXT_DISABLE_TURBOPACK: process.env.NEXT_DISABLE_TURBOPACK ?? '1' };

  // Next.js may still opt into Turbopack when TURBOPACK flags are present.
  // Explicitly unset to keep CI/local builds stable on Windows.
  delete env.TURBOPACK;
  delete env.NEXT_TURBOPACK;
  delete env.NEXT_FORCE_TURBOPACK;
  delete env.NEXT_PRIVATE_TURBOPACK;

  const hasBundlerFlag = userArgs.some((arg) => arg === '--webpack' || arg === '--turbo' || arg === '--turbopack');
  const args = [nextBin, 'build', ...(hasBundlerFlag ? [] : ['--webpack']), ...userArgs];

  const child = spawn(process.execPath, args, { stdio: 'inherit', env });
  child.on('exit', (code) => {
    if ((code ?? 0) === 0) {
      try {
        ensureBuildIdFile();
      } catch {
        // Non-fatal: build succeeded; this is only needed for local `next start`.
      }
    }
    process.exit(code ?? 0);
  });
  child.on('error', (error) => {
    console.error(String(error?.message || error));
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});
