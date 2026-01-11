'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackPageView } from '@/lib/analytics';
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from '@/lib/cookies/consent';

/**
 * Google Analytics 4 Component
 * 
 * Loads GA4 tracking script and automatically tracks page views on route changes.
 * Only loads in production unless NEXT_PUBLIC_GA_DEBUG is set to 'true'.
 * 
 * Environment variables required:
 * - NEXT_PUBLIC_GA_MEASUREMENT_ID: Your GA4 Measurement ID (G-XXXXXXXXXX)
 * - NEXT_PUBLIC_GA_DEBUG (optional): Set to 'true' to enable in development
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const isDebugMode = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const [hasConsent, setHasConsent] = useState(false);

  const shouldLoad = Boolean(measurementId) && (isProduction || isDebugMode);

  // Determine cookie consent (client-side)
  useEffect(() => {
    if (!shouldLoad) {
      return;
    }

    const updateConsent = () => {
      setHasConsent(hasAnalyticsConsent());
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
  }, [shouldLoad]);

  // Track page views when route changes
  useEffect(() => {
    if (!shouldLoad || !hasConsent) return;

    if (pathname) {
      const query = searchParams?.toString();
      const url = pathname + (query ? `?${query}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, shouldLoad, hasConsent]);

  if (!shouldLoad || !hasConsent) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', { send_page_view: false });
          `,
        }}
      />
    </>
  );
}
