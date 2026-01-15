'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { trackEvent, trackPageView } from '@/lib/analytics';
import { COOKIE_CONSENT_CHANGED_EVENT, hasAnalyticsConsent, hasMarketingConsent } from '@/lib/cookies/consent';

/**
 * Tracking bootstrap (GTM-only)
 *
 * Loads Google Tag Manager (GTM) only after the user has granted consent.
 * Page views and engagement events are emitted to `dataLayer` (for GTM) and
 * should be forwarded to GA4 via GTM tags.
 *
 * Only loads in production unless NEXT_PUBLIC_GA_DEBUG is set to 'true'.
 *
 * Environment variables:
 * - NEXT_PUBLIC_GTM_ID: Your GTM Container ID (GTM-XXXXXXX)
 * - NEXT_PUBLIC_GA_DEBUG (optional): Set to 'true' to enable in development
 */
export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const isDebugMode = process.env.NEXT_PUBLIC_GA_DEBUG === 'true';
  const isProduction = process.env.NODE_ENV === 'production';
  const [hasAnalytics, setHasAnalytics] = useState(false);
  const [hasMarketing, setHasMarketing] = useState(false);

  const scrollTrackedPathRef = useRef<string | null>(null);

  const shouldLoadGTM = Boolean(gtmId) && (isProduction || isDebugMode);
  const hasAnyConsent = hasAnalytics || hasMarketing;

  // Determine cookie consent (client-side)
  useEffect(() => {
    if (!shouldLoadGTM) {
      return;
    }

    const updateConsent = () => {
      setHasAnalytics(hasAnalyticsConsent());
      setHasMarketing(hasMarketingConsent());
    };

    updateConsent();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, updateConsent);
  }, [shouldLoadGTM]);

  // Tell GTM what the user consented to (so tags can gate themselves)
  useEffect(() => {
    if (!shouldLoadGTM) return;
    if (!hasAnyConsent) return;

    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'consent_update',
        consent: {
          analytics: hasAnalytics,
          marketing: hasMarketing,
        },
      });
    } catch {
      // ignore
    }
  }, [hasAnalytics, hasMarketing, hasAnyConsent, shouldLoadGTM]);

  // Track page views when route changes
  useEffect(() => {
    if (!shouldLoadGTM || !hasAnyConsent) return;
    if (!hasAnalytics) return;

    if (pathname) {
      const query = searchParams?.toString();
      const url = pathname + (query ? `?${query}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams, shouldLoadGTM, hasAnalytics, hasAnyConsent]);

  // Track scroll depth milestones per page
  useEffect(() => {
    if (!shouldLoadGTM || !hasAnyConsent) return;
    if (!hasAnalytics) return;
    if (!pathname) return;

    const pagePath = pathname;
    scrollTrackedPathRef.current = pagePath;
    const fired = new Set<number>();
    const thresholds = [25, 50, 75, 100];

    const computePercent = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY ?? doc.scrollTop ?? 0;
      const scrollable = Math.max(0, doc.scrollHeight - window.innerHeight);
      if (scrollable <= 0) return 100;
      return Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
    };

    const onScroll = () => {
      if (scrollTrackedPathRef.current !== pagePath) return;
      const percent = computePercent();
      for (const threshold of thresholds) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          trackEvent('scroll_depth', {
            percent: threshold,
            page_path: pagePath,
          });
        }
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname, shouldLoadGTM, hasAnalytics, hasAnyConsent]);

  return (
    <>
      {shouldLoadGTM && hasAnyConsent && gtmId ? (
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

      {shouldLoadGTM && hasAnyConsent && gtmId ? (
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
            title="gtm"
          />
        </noscript>
      ) : null}
    </>
  );
}
