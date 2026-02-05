import { defineConfig, devices } from '@playwright/test';
import { CONSENT_COOKIE_NAME } from './lib/cookies/consent';

/**
 * Playwright configuration for yakiwood-website E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
const COOKIE_CONSENT_VALUE = `v2:${JSON.stringify({ analytics: true, marketing: true })}`;
const COOKIE_CONSENT_COOKIE = {
  name: CONSENT_COOKIE_NAME,
  value: COOKIE_CONSENT_VALUE,
  domain: '127.0.0.1',
  path: '/',
  httpOnly: false,
  secure: false,
  sameSite: 'Lax' as const,
  // Make sure Playwright storageState cookie has a numeric expiry (seconds since epoch)
  expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    storageState: {
      cookies: [COOKIE_CONSENT_COOKIE],
      origins: [],
    },
    // Increase timeouts for slower dev builds / SSR rendering
    navigationTimeout: 60_000, // 60s for page.goto and navigation-related waits
    actionTimeout: 30_000, // actions (click/type) default timeout
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'tablet',
      use: { ...devices['iPad (gen 7)'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    // Reuse existing server when present (helps local dev workflows). In CI this becomes false.
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
