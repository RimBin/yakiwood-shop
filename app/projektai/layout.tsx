import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getOgImage } from '@/lib/og-image';
import { canonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.projects');
  const canonical = canonicalUrl('/projects', 'lt');
  const ogImage = getOgImage('projects');
  
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: t('ogTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: [ogImage],
    },
  };
}

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
