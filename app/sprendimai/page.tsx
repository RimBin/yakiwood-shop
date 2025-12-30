import Solutions from '@/app/solutions/page';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Sprendimai - Shou Sugi Ban Panaudojimai',
  description: 'Atraskite mūsų Shou Sugi Ban medienos sprendimus fasadams, interjerams, terasoms ir tvoroms. Tvarios ir gražios architektūrinės aplikacijos.',
  openGraph: {
    title: 'Sprendimai - Yakiwood Shou Sugi Ban',
    description: 'Atraskite mūsų Shou Sugi Ban medienos sprendimus fasadams, interjerams, terasoms ir tvoroms.',
    url: 'https://yakiwood.lt/sprendimai',
    images: [{ url: getOgImage('solutions'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('solutions')],
  },
};

export default Solutions;
