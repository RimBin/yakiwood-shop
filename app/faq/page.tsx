import Accordion from '@/components/ui/Accordion';
// PageCover removed per request
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';
import { getLocale, getTranslations } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { applySeoOverride } from '@/lib/seo/overrides';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.faq');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/faq', currentLocale);
  
  const metadata: Metadata = {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: canonical,
      type: 'website',
      siteName: 'Yakiwood',
      images: [{ url: getOgImage('faq'), width: 1200, height: 630, alt: t('ogTitle') }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: [getOgImage('faq')],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

const faqItems = [
  {
    title: 'Kas yra Shou Sugi Ban?',
    content: 'Shou Sugi Ban yra senovinė japonų medienos apsaugos technika, deginant ją. Šis procesas sukuria unikalų, ilgaamžį apdailos sluoksnį, kuris natūraliai atsparus ugniai, vabzdžiams ir puvimui.',
    defaultOpen: true,
  },
  {
    title: 'Kiek laiko tarnauja degintas medis?',
    content: 'Tinkamai apdorotas Shou Sugi Ban technika medis gali tarnauti 80-100 metų ar ilgiau be reikšmingos priežiūros.',
  },
  {
    title: 'Ar siunčiate į užsienį?',
    content: 'Taip, siunčiame savo produktus visame pasaulyje. Pristatymo išlaidos ir pristatymo laikas priklauso nuo jūsų vietos. Susisiekite su mumis dėl konkrečios siuntimo kainos.',
  },
  {
    title: 'Ar galiu pasirinkti spalvą?',
    content: 'Žinoma! Siūlome įvairius degimo lygius nuo šviesaus iki gilaus juodo, taip pat galime taikyti skirtingas apdailas ir aliejus, kad pasiektume norimą išvaizdą.',
  },
  {
    title: 'Kokias medienos rūšis naudojate?',
    content: 'Dažniausiai dirbame su pušimi, maumedžiu ir kedru. Kiekviena rūšis pasižymi unikaliomis savybėmis struktūros raštų ir ilgaamžiškumo atžvilgiu.',
  },
  {
    title: 'Ar siūlote montavimo paslaugas?',
    content: 'Taip, galime rekomenduoti profesionalius montavimo partnerius jūsų regione arba pateikti išsamias montavimo gaires DIY projektams.',
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover removed */}

      {/* FAQ Content */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
        <div className="max-w-[1016px] mx-auto sm:ml-[384px]">
          <Accordion items={faqItems} />
        </div>
      </div>
    </main>
  );
}
