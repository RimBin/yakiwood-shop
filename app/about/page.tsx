import About from '@/components/About';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Apie mus',
  description: 'Yakiwood specializuojasi tradicine japonų Shou Sugi Ban deginto medžio technika fasadams, terasoms ir interjerams.',
  openGraph: {
    title: 'Apie mus - Yakiwood',
    description: 'Yakiwood specializuojasi tradicine japonų Shou Sugi Ban deginto medžio technika.',
    url: 'https://yakiwood.lt/apie',
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
