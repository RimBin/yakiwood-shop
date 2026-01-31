"use client";

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const pathname = usePathname();
  const currentLocale = useMemo<AppLocale>(() => (pathname.startsWith('/lt') ? 'lt' : 'en'), [pathname]);

  useEffect(() => {
    // Legacy query-param tabs: keep old URLs working, but route to the new pages.
    if (tabParam === 'projects') {
      router.replace(toLocalePath('/admin/projects', currentLocale));
      return;
    }
    if (tabParam === 'posts') {
      router.replace(toLocalePath('/admin/posts', currentLocale));
      return;
    }
    if (tabParam === 'products') {
      router.replace(toLocalePath('/admin/products', currentLocale));
      return;
    }
    if (tabParam === 'seo') {
      router.replace(toLocalePath('/admin/seo', currentLocale));
      return;
    }
    if (tabParam === 'email-templates') {
      router.replace(toLocalePath('/admin/email-templates', currentLocale));
      return;
    }

    // Canonical entrypoint.
    router.replace(toLocalePath('/admin/dashboard', currentLocale));
  }, [router, tabParam, currentLocale]);

  return null;
}

