import Solutions from '@/app/solutions/page';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Solutions - Shou Sugi Ban Applications',
  description: 'Explore our Shou Sugi Ban wood solutions for facades, interiors, terraces, and fences. Sustainable and beautiful architectural applications.',
  openGraph: {
    title: 'Solutions - Yakiwood Shou Sugi Ban',
    description: 'Explore our Shou Sugi Ban wood solutions for facades, interiors, terraces, and fences.',
    url: 'https://yakiwood.lt/sprendimai',
    images: [{ url: getOgImage('solutions'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('solutions')],
  },
};

export default Solutions;
