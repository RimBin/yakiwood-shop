import About from '@/components/About';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Yakiwood specializes in traditional Japanese Shou Sugi Ban burnt wood technique for facades, terraces, and interiors.',
  openGraph: {
    title: 'About Us - Yakiwood',
    description: 'Yakiwood specializes in traditional Japanese Shou Sugi Ban burnt wood technique.',
    url: 'https://yakiwood.lt/about',
    images: [{ url: getOgImage('about'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('about')],
  },
};

export default function AboutPage() {
  return <About />;
}
