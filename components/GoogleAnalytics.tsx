'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { trackPageView } from '@/lib/analytics';
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent, hasMarketingConsent } from '@/lib/cookies/consent';

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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const isDebugMode = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const [hasAnalytics, setHasAnalytics] = useState(false);
  const [hasMarketing, setHasMarketing] = useState(false);

  const shouldLoadGA = Boolean(measurementId) && (isProduction || isDebugMode);
  const shouldLoadGTM = Boolean(gtmId) && (isProduction || isDebugMode);

  // Determine cookie consent (client-side)
  useEffect(() => {
    if (!shouldLoadGA && !shouldLoadGTM) {
      return;
    }

    const updateConsent = () => {
      setHasAnalytics(hasAnalyticsConsent());
      setHasMarketing(hasMarketingConsent());
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
  }, [shouldLoadGA, shouldLoadGTM]);

  // Track page views when route changes
  useEffect(() => {
    if (!shouldLoadGA || !hasAnalytics) return;

    if (pathname) {
      const query = searchParams?.toString();
      const url = pathname + (query ? `?${query}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, shouldLoadGA, hasAnalytics]);

  return (
    <>
      {shouldLoadGTM && hasMarketing && gtmId ? (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      ) : null}

      {shouldLoadGA && hasAnalytics && measurementId ? (
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
      ) : null}
    </>
  );
}
