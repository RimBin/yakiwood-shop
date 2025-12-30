import { Hero, WhyUs, Steps, Testimonials, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Yakiwood - Premium Shou Sugi Ban Deginto Medžio Produktai',
  description: 'Atraskite premium Shou Sugi Ban deginto medžio produktus Lietuvoje. Tradicinė japonų degimo technika tvariai, ilgaamžei ir gražiai medžio fasadų ir paviršių apdailai.',
  keywords: ['Shou Sugi Ban', 'yakisugi', 'degintas medis', 'anglinis medis', 'medienos fasadai', 'tvari mediena', 'Lietuva', 'japonų technika'],
  openGraph: {
    title: 'Yakiwood - Premium Shou Sugi Ban Deginto Medžio Produktai',
    description: 'Atraskite premium Shou Sugi Ban deginto medžio produktus Lietuvoje. Tradicinė japonų degimo technika tvariai, ilgaamžei ir gražiai medžio fasadų ir paviršių apdailai.',
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
    title: 'Yakiwood - Premium Shou Sugi Ban Deginto Medžio Produktai',
    description: 'Atraskite premium Shou Sugi Ban deginto medžio produktus Lietuvoje.',
    images: [getOgImage('home')],
  },
};

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
