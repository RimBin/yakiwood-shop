import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getOgImage } from '@/lib/og-image';
import ConfiguratorPage from '@/components/configurator/ConfiguratorPage';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.configurator3d');

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: 'https://yakiwood.lt/configurator3d',
      images: [{ url: getOgImage('products'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [getOgImage('products')],
    },
  };
}

export default function Configurator3DPage() {
  return <ConfiguratorPage />;
}
