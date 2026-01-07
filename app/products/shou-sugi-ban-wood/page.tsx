import type { Metadata } from 'next';
import ConfiguratorShell from '@/components/configurator/ConfiguratorShell';
import { getCanonicalProductPath, getPresetRobotsMeta } from '@/components/configurator/seo';

const PRODUCT_SLUG = 'shou-sugi-ban-wood';

export interface ShouSugiBanProductPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ShouSugiBanProductPageProps): Promise<Metadata> {
  const resolved = (await searchParams) ?? {};
  const presetRaw = resolved.preset;
  const preset = Array.isArray(presetRaw) ? presetRaw[0] : presetRaw;

  return {
    title: 'Shou Sugi Ban mediena',
    description: 'Konfigūruokite Shou Sugi Ban lentas: mediena, paskirtis, spalva ir profilis. 2D peržiūra yra numatyta, 3D įjungiama pasirinkus "3D".',
    alternates: {
      canonical: getCanonicalProductPath(PRODUCT_SLUG),
    },
    robots: getPresetRobotsMeta(preset),
    openGraph: {
      title: 'Shou Sugi Ban mediena',
      description: 'Konfigūruokite Shou Sugi Ban lentas: mediena, paskirtis, spalva ir profilis.',
      url: `https://yakiwood.lt${getCanonicalProductPath(PRODUCT_SLUG)}`,
      images: [
        {
          url: 'https://yakiwood.lt/assets/imgSpruce.png',
          width: 1200,
          height: 630,
          alt: 'Shou Sugi Ban mediena',
        },
      ],
      type: 'website',
    },
  };
}

export default async function ShouSugiBanProductPage({ searchParams }: ShouSugiBanProductPageProps) {
  const resolved = (await searchParams) ?? {};
  const presetRaw = resolved.preset;
  const preset = Array.isArray(presetRaw) ? presetRaw[0] : presetRaw;

  return <ConfiguratorShell productSlug={PRODUCT_SLUG} presetSlug={preset ?? null} />;
}
