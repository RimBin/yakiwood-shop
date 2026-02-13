import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { applySeoOverride } from '@/lib/seo/overrides';
import getSitemap from '../sitemap';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/svetaines-zemelapis', currentLocale);

  const metadata: Metadata = {
    title: currentLocale === 'lt' ? 'Svetainės žemėlapis' : 'Sitemap',
    description:
      currentLocale === 'lt'
        ? 'Visų puslapių sąrašas.'
        : 'List of all pages.',
    alternates: {
      canonical,
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function SitemapPage() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const items = await getSitemap();

  const links = items
    .map((item) => {
      try {
        const url = new URL(item.url);
        return { href: url.pathname, label: url.pathname };
      } catch {
        return { href: item.url, label: item.url };
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <main className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="font-['DM_Sans'] text-4xl font-light tracking-[-1.2px] text-[#161616] mb-8">
          {currentLocale === 'lt' ? 'Svetainės žemėlapis' : 'Sitemap'}
        </h1>
        <div className="bg-white rounded-[24px] p-8">
          <ul className="space-y-3">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-['Outfit'] text-base text-[#161616] hover:text-[#000] underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
