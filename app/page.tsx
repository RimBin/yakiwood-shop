import { Hero, WhyUs, Steps, Testimonials, AboutUs, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getLocale, getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/', currentLocale);
  const title = t('title');
  const description = t('description');

  return {
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
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
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
