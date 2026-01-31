import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getLocale, getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { applySeoOverride } from '@/lib/seo/overrides';
import InView from '@/components/InView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.news');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/naujienos', currentLocale);
  const ogImage = getOgImage('projects');
  
  const metadata: Metadata = {
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

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] py-16">
      <InView className="hero-animate-root">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="font-['DM_Sans'] text-5xl font-light tracking-[-1.6px] text-[#161616] mb-12 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            News & Updates
          </h1>
          <div className="bg-white rounded-[24px] p-12 text-center hero-seq-item hero-seq-right" style={{ animationDelay: '180ms' }}>
            <p className="font-['Outfit'] text-lg text-[#535353]">
              News section coming soon. Stay tuned for updates on new products, projects, and innovations in Shou Sugi Ban wood.
            </p>
          </div>
        </div>
      </InView>
    </main>
  );
}
