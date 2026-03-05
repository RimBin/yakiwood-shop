'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const GoogleAnalytics = dynamic(() => import('@/components/GoogleAnalytics'), {
  ssr: false,
});

const CookieConsentBanner = dynamic(() => import('@/components/CookieConsentBanner'), {
  ssr: false,
});

export default function DeferredGlobals() {
  const [loadAnalytics, setLoadAnalytics] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const handle = win.requestIdleCallback(() => setLoadAnalytics(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(handle);
    }

    const timeout = window.setTimeout(() => setLoadAnalytics(true), 1000);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <>
      {loadAnalytics ? <GoogleAnalytics /> : null}
      <CookieConsentBanner />
    </>
  );
}
