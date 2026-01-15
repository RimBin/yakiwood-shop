'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export default function NotFoundTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    const query = searchParams?.toString();
    const pagePath = (pathname || '/') + (query ? `?${query}` : '');

    if (trackedRef.current === pagePath) return;

    trackEvent('page_not_found', {
      page_path: pagePath,
      page_location: typeof window !== 'undefined' ? window.location.href : pagePath,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    });

    trackedRef.current = pagePath;
  }, [pathname, searchParams]);

  return null;
}
