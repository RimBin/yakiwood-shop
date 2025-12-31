import Solutions from '@/app/solutions/page';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.solutions');
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: 'https://yakiwood.lt/sprendimai',
      images: [{ url: getOgImage('solutions'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [getOgImage('solutions')],
    },
  };
}

export default Solutions;
