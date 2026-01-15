"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    // Legacy query-param tabs: keep old URLs working, but route to the new pages.
    if (tabParam === 'projects') {
      router.replace('/admin/projects');
      return;
    }
    if (tabParam === 'posts') {
      router.replace('/admin/posts');
      return;
    }
    if (tabParam === 'products') {
      router.replace('/admin/products');
      return;
    }
    if (tabParam === 'seo') {
      router.replace('/admin/seo');
      return;
    }
    if (tabParam === 'email-templates') {
      router.replace('/admin/email-templates');
      return;
    }

    // Canonical entrypoint.
    router.replace('/admin/dashboard');
  }, [router, tabParam]);

  return null;
}

