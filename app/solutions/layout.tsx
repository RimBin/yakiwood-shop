import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { getOgImage } from '@/lib/og-image';
import { canonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.solutions');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/solutions', currentLocale);

  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: canonical,
      type: 'website',
      siteName: 'Yakiwood',
      images: [{ url: getOgImage('solutions'), width: 1200, height: 630, alt: t('ogTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: [getOgImage('solutions')],
    },
  };
}

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
