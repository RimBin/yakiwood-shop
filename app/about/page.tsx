import About from '@/components/About';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.about');
  
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: 'https://yakiwood.lt/apie',
      images: [{ url: getOgImage('about'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [getOgImage('about')],
    },
  };
}

export default function AboutPage() {
  return <About />;
}
