import Contact from '@/components/Contact';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.contact');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: 'https://yakiwood.lt/kontaktai',
      images: [{ url: getOgImage('contact'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [getOgImage('contact')],
    },
  };
}

export default function KontaktaiPage() {
  return (
    <main className="min-h-screen bg-white">
      <Contact />
    </main>
  );
}
