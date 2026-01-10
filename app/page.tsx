import { Hero, WhyUs, Steps, Testimonials, CTA } from '@/components/home';
import Products from '@/components/Products';
import Solutions from '@/components/Solutions';
import Projects from '@/components/Projects';
import FAQ from '@/components/FAQ';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Yakiwood - Premium Shou Sugi Ban Burnt Wood Products',
  description: 'Discover premium Shou Sugi Ban burnt wood products in Lithuania. Traditional Japanese charring technique for sustainable, durable, and beautiful wood facades and surfaces.',
  keywords: ['Shou Sugi Ban', 'yakisugi', 'burnt wood', 'charred wood', 'wood facades', 'sustainable wood', 'Lithuania', 'Japanese technique'],
  openGraph: {
    title: 'Yakiwood - Premium Shou Sugi Ban Burnt Wood Products',
    description: 'Discover premium Shou Sugi Ban burnt wood products in Lithuania. Traditional Japanese charring technique for sustainable, durable, and beautiful wood facades and surfaces.',
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
    title: 'Yakiwood - Premium Shou Sugi Ban Burnt Wood Products',
    description: 'Discover premium Shou Sugi Ban burnt wood products in Lithuania.',
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
