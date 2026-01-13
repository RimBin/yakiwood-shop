'use client';

import Link from 'next/link';
import { useMemo, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type AdminTabKey =
  | 'dashboard'
  | 'products'
  | 'projects'
  | 'posts'
  | 'users'
  | 'chatbot'
  | 'seo'
  | 'email-templates';

type TabCounts = Partial<Record<'products' | 'projects' | 'posts', number>>;

type HeaderTab = {
  key: AdminTabKey;
  label: string;
  href: string;
  count?: number;
};

function safeParseArrayCount(value: string | null): number | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.length : undefined;
  } catch {
    return undefined;
  }
}

function stripLocalePrefix(pathname: string): string {
  // This project sometimes exposes routes with '/lt' prefix via next-intl.
  // Keep the logic robust by normalizing to non-prefixed paths.
  if (pathname.startsWith('/lt/')) return pathname.slice(3);
  return pathname;
}

function getActiveTabFromUrl(pathname: string, tabParam: string | null): AdminTabKey {
  const p = stripLocalePrefix(pathname);

  if (p.startsWith('/admin/products')) return 'products';
  if (p.startsWith('/admin/users')) return 'users';
  if (p.startsWith('/admin/chatbot')) return 'chatbot';
  if (p.startsWith('/admin/seo')) return 'seo';
  if (p.startsWith('/admin/email-templates')) return 'email-templates';
  if (p.startsWith('/admin/dashboard')) return 'dashboard';

  // /admin root: allow internal demo tabs via ?tab=
  if (p === '/admin') {
    if (tabParam === 'projects') return 'projects';
    if (tabParam === 'posts') return 'posts';
    // Default for /admin is products (matches current demo UI).
    return 'products';
  }

  // Fallback
  return 'dashboard';
}

export default function AdminPanelHeader() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');

  const activeTab = useMemo(() => {
    return getActiveTabFromUrl(pathname, tabParam);
  }, [pathname, tabParam]);

  const [counts, setCounts] = useState<TabCounts>({});

  useEffect(() => {
    // Best-effort counts. These are used only for header badges.
    // We read from localStorage to keep it fast and avoid SSR coupling.
    if (typeof window === 'undefined') return;

    const nextCounts: TabCounts = {
      products: safeParseArrayCount(localStorage.getItem('yakiwood_products')),
      projects: safeParseArrayCount(localStorage.getItem('yakiwood_projects')),
      posts: safeParseArrayCount(localStorage.getItem('yakiwood_posts')),
    };

    setCounts((prev) => {
      // Avoid re-render loops if nothing changed.
      const keys: Array<keyof TabCounts> = ['products', 'projects', 'posts'];
      const changed = keys.some((k) => prev[k] !== nextCounts[k]);
      return changed ? nextCounts : prev;
    });
  }, [pathname]);

  const pathPrefix = useMemo(() => (pathname.startsWith('/lt/') ? '/lt' : ''), [pathname]);

  const tabs = useMemo<HeaderTab[]>(
    () => [
      { key: 'dashboard', label: t('tabs.dashboard'), href: `${pathPrefix}/admin/dashboard` },
      {
        key: 'products',
        label: t('tabs.products'),
        href: `${pathPrefix}/admin/products`,
        count: counts.products,
      },
      {
        key: 'projects',
        label: t('tabs.projects'),
        href: `${pathPrefix}/admin?tab=projects`,
        count: counts.projects,
      },
      {
        key: 'posts',
        label: t('tabs.posts'),
        href: `${pathPrefix}/admin?tab=posts`,
        count: counts.posts,
      },
      { key: 'users', label: t('tabs.users'), href: `${pathPrefix}/admin/users` },
      { key: 'chatbot', label: t('tabs.chatbot'), href: `${pathPrefix}/admin/chatbot` },
      { key: 'seo', label: t('tabs.seo'), href: `${pathPrefix}/admin/seo` },
      { key: 'email-templates', label: t('tabs.emailTemplates'), href: `${pathPrefix}/admin/email-templates` },
    ],
    [t, counts, pathPrefix]
  );

  return (
    <div className="bg-[#E1E1E1] pt-[clamp(32px,5vw,64px)] px-[clamp(16px,3vw,40px)]">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-[clamp(24px,3vw,40px)]">
          <h1 className="font-['DM_Sans'] font-light text-[clamp(40px,6vw,72px)] leading-none tracking-[clamp(-1.6px,-0.025em,-2.88px)] text-[#161616]">
            {t('main.title')}
          </h1>
          <p className="mt-[8px] font-['Outfit'] font-light text-[clamp(14px,1.5vw,16px)] text-[#535353]">
            {t('main.subtitle')}
          </p>
        </div>

        <div className="flex gap-[8px] overflow-x-auto pb-[8px]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const label =
              typeof tab.count === 'number' ? `${tab.label} (${tab.count})` : tab.label;

            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={
                  `h-[48px] px-[24px] rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase transition-all whitespace-nowrap inline-flex items-center ` +
                  (isActive
                    ? 'bg-[#161616] text-white'
                    : 'bg-[#EAEAEA] text-[#161616] hover:bg-[#DCDCDC]')
                }
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Spacer to match original header rhythm */}
        <div className="h-[24px]" />
      </div>
    </div>
  );
}
