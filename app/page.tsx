import { Hero, WhyUs, Steps, Testimonials, AboutUs, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getLocale, getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { applySeoOverride } from '@/lib/seo/overrides';
import { generateFAQSchema } from '@/lib/schema';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/', currentLocale);
  const title = t('title');
  const description = t('description');

  const metadata: Metadata = {
    title,
    description,
    keywords: [
      'Shou Sugi Ban',
      'yakisugi',
      'burnt wood',
      'charred wood',
      'wood facades',
      'sustainable wood',
      'Lithuania',
      'Japanese technique',
    ],
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Yakiwood',
      images: [
        {
          url: getOgImage('home'),
          width: 1200,
          height: 630,
          alt: t('ogAlt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImage('home')],
    },
    alternates: {
      canonical,
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function Home() {
  const tFaq = await getTranslations('home.faq');
  const faqKeys = ['01', '02', '03', '04', '05', '06', '07'] as const;
  const faqItems = faqKeys.map((key) => ({
    question: tFaq(`items.${key}.question`),
    answer: tFaq(`items.${key}.answer`),
  }));
  const faqSchema = generateFAQSchema(faqItems);

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <WhyUs />
      <Products />
      <Solutions />
      <Projects />
      <Steps />
      <Testimonials />
      <AboutUs />
      <FAQ />
      <CTA />
    </main>
  );
}
