const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

function parsePort(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '-p' || arg === '--port') {
      const next = args[i + 1];
      const port = Number(next);
      if (Number.isFinite(port) && port > 0) return port;
    }
    if (arg && arg.startsWith('--port=')) {
      const port = Number(arg.slice('--port='.length));
      if (Number.isFinite(port) && port > 0) return port;
    }
  }
  return 3000;
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const done = (result) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(400);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));

    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  const userArgs = process.argv.slice(2);
  const port = parsePort(userArgs);
  const lockPath = path.join(process.cwd(), '.next', 'dev', 'lock');

  if (fs.existsSync(lockPath)) {
    const portOpen = await isPortOpen(port);
    if (portOpen) {
      console.log(`Next dev is already running: http://localhost:${port}`);
      console.log('Stop the running process (or run `npm run dev:unlock`) to restart.');
      return;
    }

    try {
      fs.unlinkSync(lockPath);
      console.log(`Removed stale Next dev lock: ${lockPath}`);
    } catch (error) {
      console.error(`Found Next dev lock but could not remove it: ${lockPath}`);
      console.error(String(error?.message || error));
      console.error('Another Next dev instance is likely running; stop it (or run `npm run dev:unlock`) and retry.');
      process.exitCode = 1;
      return;
    }
  }

  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  if (!fs.existsSync(nextBin)) {
    console.error(`Next.js binary not found at ${nextBin}`);
    console.error('Run `npm install` first.');
    process.exitCode = 1;
    return;
  }

  // Turbopack can be flaky on Windows filesystems (SST/compaction errors). Default to Webpack.
  // If you explicitly want Turbopack, run: `NEXT_DISABLE_TURBOPACK=0 npm run dev`.
  const env = { ...process.env, NEXT_DISABLE_TURBOPACK: process.env.NEXT_DISABLE_TURBOPACK ?? '1' };
  const child = spawn(process.execPath, [nextBin, 'dev', ...userArgs], { stdio: 'inherit', env });
  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (error) => {
    console.error(String(error?.message || error));
    process.exit(1);
  });
}

main().catch((error) => {
  console.error(String(error?.message || error));
  process.exit(1);
});

