import Accordion from '@/components/ui/Accordion';
// PageCover removed per request
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getLocale, getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { applySeoOverride } from '@/lib/seo/overrides';
import { generateFAQSchema } from '@/lib/schema';
import InView from '@/components/InView';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.faq');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/faq', currentLocale);
  
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
      images: [{ url: getOgImage('faq'), width: 1200, height: 630, alt: t('ogTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: [getOgImage('faq')],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function FAQPage() {
  const tFaq = await getTranslations('home.faq');
  const faqKeys = ['01', '02', '03', '04', '05', '06', '07'] as const;
  const faqItems = faqKeys.map((key) => ({
    title: tFaq(`items.${key}.question`),
    content: tFaq(`items.${key}.answer`),
  }));

  const faqSchema = generateFAQSchema(
    faqItems.map((item) => ({ question: item.title, answer: item.content }))
  );

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Cover removed */}

      {/* FAQ Content */}
      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
          <div className="max-w-[1016px] mx-auto sm:ml-[384px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <Accordion items={faqItems} />
          </div>
        </div>
      </InView>
    </main>
  );
}
