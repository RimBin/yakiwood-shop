import Contact from '@/components/Contact';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = { 
  title: 'Kontaktai',
  description: 'Reikalinga pagalba? Palikite savo kontaktinius duomenis ir mūsų vadybininkas susisieks dėl konsultacijos.',
  openGraph: {
    title: 'Kontaktai - Yakiwood',
    description: 'Reikalinga pagalba? Palikite savo kontaktinius duomenis ir mūsų vadybininkas susisieks dėl konsultacijos.',
    url: 'https://yakiwood.lt/kontaktai',
    images: [{ url: getOgImage('contact'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('contact')],
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Contact />
    </main>
  );
}
