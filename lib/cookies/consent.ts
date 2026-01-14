export const CONSENT_COOKIE_NAME = 'COOKIE_CONSENT' as const;
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-changed' as const;
export const COOKIE_CONSENT_OPEN_EVENT = 'cookie-consent-open' as const;

export type CookieConsent = {
  analytics: boolean;
  marketing: boolean;
};

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const V2_PREFIX = 'v2:';

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const cookies = document.cookie.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    if (!cookie) continue;
    const eqIndex = cookie.indexOf('=');
    const key = eqIndex >= 0 ? cookie.slice(0, eqIndex) : cookie;
    if (key === name) {
      return eqIndex >= 0 ? decodeURIComponent(cookie.slice(eqIndex + 1)) : '';
    }
  }
  return undefined;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAgeSeconds};SameSite=Lax`;
}

export function getConsentFromDocumentCookie(): CookieConsent | null {
  const raw = readCookie(CONSENT_COOKIE_NAME);
  if (!raw) return null;

  // Backward compatibility with earlier simple values.
  if (raw === 'accepted') return { analytics: true, marketing: false };
  if (raw === 'rejected') return { analytics: false, marketing: false };

  if (raw.startsWith(V2_PREFIX)) {
    const json = raw.slice(V2_PREFIX.length);
    try {
      const parsed = JSON.parse(json) as Partial<CookieConsent>;
      return {
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      };
    } catch {
      return null;
    }
  }

  return null;
}

export function setConsentCookie(consent: CookieConsent) {
  setCookie(CONSENT_COOKIE_NAME, `${V2_PREFIX}${JSON.stringify(consent)}`, ONE_YEAR_SECONDS);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COOKIE_CONSENT_CHANGED_EVENT));
  }
}

export function hasAnalyticsConsent(): boolean {
  const consent = getConsentFromDocumentCookie();
  return Boolean(consent?.analytics);
}

export function hasMarketingConsent(): boolean {
  const consent = getConsentFromDocumentCookie();
  return Boolean(consent?.marketing);
}
