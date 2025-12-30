import Contact from '@/components/Contact';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = { 
  title: 'Contact',
  description: 'Need assistance? Leave your contact details, and our manager will reach out for a consultation.',
  openGraph: {
    title: 'Contact - Yakiwood',
    description: 'Need assistance? Leave your contact details, and our manager will reach out for a consultation.',
    url: 'https://yakiwood.lt/contact',
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
