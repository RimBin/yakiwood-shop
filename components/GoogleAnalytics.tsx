'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

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

  // Don't load GA if measurement ID is not set
  if (!measurementId) {
    return null;
  }

  // Only load in production or debug mode
  if (!isProduction && !isDebugMode) {
    return null;
  }

  // Track page views when route changes
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
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
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}
