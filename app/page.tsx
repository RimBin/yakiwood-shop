import { Hero, WhyUs, Steps, Testimonials, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.home');
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Shou Sugi Ban', 'yakisugi', 'degintas medis', 'anglinis medis', 'medienos fasadai', 'tvari mediena', 'Lietuva', 'japonų technika'],
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: 'https://yakiwood.lt',
      images: [
        {
          url: getOgImage('home'),
          width: 1200,
          height: 630,
          alt: 'Yakiwood Shou Sugi Ban Products',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: [getOgImage('home')],
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
      <FAQ />
      <CTA />
    </main>
  );
}
