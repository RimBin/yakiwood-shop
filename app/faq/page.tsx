import Accordion from '@/components/ui/Accordion';
import { PageCover } from '@/components/shared/PageLayout';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'DUK - Dažniausiai užduodami klausimai',
  description: 'Atsakymai į dažniausiai užduodamus klausimus apie Shou Sugi Ban deginto medžio produktus, pristatymą, montavimą ir priežiūrą.',
  openGraph: {
    title: 'DUK - Yakiwood',
    description: 'Atsakymai į dažniausiai užduodamus klausimus apie Shou Sugi Ban deginto medžio produktus.',
    url: 'https://yakiwood.lt/faq',
    images: [{ url: getOgImage('about'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('about')],
  },
};

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
      {/* Cover Section */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          DUK
        </h1>
      </PageCover>

      {/* FAQ Content */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
        <div className="max-w-[1016px] mx-auto sm:ml-[384px]">
          <Accordion items={faqItems} />
        </div>
      </div>
    </main>
  );
}
