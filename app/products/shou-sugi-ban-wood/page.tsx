import type { Metadata } from 'next';
import ConfiguratorShell from '@/components/configurator/ConfiguratorShell';
import { getPresetRobotsMeta } from '@/components/configurator/seo';
import { getLocale } from 'next-intl/server';
import { toLocalePath } from '@/i18n/paths';

const PRODUCT_SLUG = 'shou-sugi-ban-wood';

export interface ShouSugiBanProductPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShouSugiBanProductPageProps): Promise<Metadata> {
  const resolved = (await searchParams) ?? {};
  const presetRaw = resolved.preset;
  const preset = Array.isArray(presetRaw) ? presetRaw[0] : presetRaw;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const productPath = toLocalePath(`/products/${PRODUCT_SLUG}`, currentLocale);
  const canonical = `https://yakiwood.lt${productPath}`;

  return {
    title: 'Shou Sugi Ban mediena',
    description: 'Konfigūruokite Shou Sugi Ban lentas: mediena, paskirtis, spalva ir profilis. 2D peržiūra yra numatyta, 3D įjungiama pasirinkus "3D".',
    alternates: {
      canonical,
    },
    robots: getPresetRobotsMeta(preset),
    openGraph: {
      title: 'Shou Sugi Ban mediena',
      description: 'Konfigūruokite Shou Sugi Ban lentas: mediena, paskirtis, spalva ir profilis.',
      url: canonical,
      images: [
        {
          url: 'https://yakiwood.lt/images/ui/wood/imgSpruce.png',
          width: 1200,
          height: 630,
          alt: 'Shou Sugi Ban mediena',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Shou Sugi Ban mediena',
      description: 'Konfigūruokite Shou Sugi Ban lentas: mediena, paskirtis, spalva ir profilis.',
      images: ['https://yakiwood.lt/images/ui/wood/imgSpruce.png'],
    },
  };
}

export default async function ShouSugiBanProductPage({ searchParams }: ShouSugiBanProductPageProps) {
  const resolved = (await searchParams) ?? {};
  const presetRaw = resolved.preset;
  const preset = Array.isArray(presetRaw) ? presetRaw[0] : presetRaw;

  return <ConfiguratorShell productSlug={PRODUCT_SLUG} presetSlug={preset ?? null} />;
}
