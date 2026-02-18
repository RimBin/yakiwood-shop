import { test as base, expect } from '@playwright/test';

type CollectedError = {
  kind: 'console' | 'pageerror' | 'requestfailed';
  message: string;
  url?: string;
};

const DEFAULT_IGNORES: Array<(err: CollectedError) => boolean> = [
  // Browser extensions / adblockers are outside app control.
  (e) => (e.url || '').startsWith('chrome-extension://'),
  (e) => e.message.toLowerCase().includes('net::err_blocked_by_client'),

  // Dev-only HMR/WebSocket noise.
  (e) => (e.url || '').includes('/_next/webpack-hmr'),

  // Transient navigation aborts can happen in dev (the tests already retry where needed).
  (e) => e.message.includes('net::ERR_ABORTED'),
  (e) => e.message.includes('NS_ERROR_ABORT'),
];

function shouldIgnore(err: CollectedError): boolean {
  return DEFAULT_IGNORES.some((fn) => {
    try {
      return fn(err);
    } catch {
      return false;
    }
  });
}

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const collected: CollectedError[] = [];
    const baseURL = String((testInfo.project.use as any)?.baseURL || '');

    page.on('pageerror', (error) => {
      collected.push({ kind: 'pageerror', message: String(error) });
    });

    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      collected.push({ kind: 'console', message: msg.text(), url: msg.location()?.url });
    });

    page.on('requestfailed', (request) => {
      const failure = request.failure();
      if (!failure) return;

      const url = request.url();
      if (baseURL && !url.startsWith(baseURL)) return; // ignore third-party failures by default

      collected.push({
        kind: 'requestfailed',
        message: `${failure.errorText}: ${request.method()} ${url}`,
        url,
      });
    });

    await use(page);

    const critical = collected.filter((e) => !shouldIgnore(e));
    if (critical.length === 0) return;

    await testInfo.attach('browser-errors', {
      body: JSON.stringify(critical, null, 2),
      contentType: 'application/json',
    });

    const preview = critical
      .slice(0, 5)
      .map((e) => `${e.kind}: ${e.message}${e.url ? ` (${e.url})` : ''}`)
      .join('\n');

    throw new Error(
      `Browser errors detected (${critical.length}). See attached browser-errors.\n\n${preview}`
    );
  },
});

export { expect };
