import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS, isIndexableVariantSlug } from '@/components/configurator/presetMap';

const BASE_URL = 'https://yakiwood.lt';

export async function generateStaticParams() {
  return INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS.map((variantSlug) => ({ variantSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const { variantSlug } = await params;

  if (!isIndexableVariantSlug(variantSlug)) {
    return {
      title: 'Variantas nerastas',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Shou Sugi Ban: ${variantSlug}`,
    description: 'Statinis SEO puslapis su pasirinkto varianto aprašymu ir nuoroda į produkto konfigūratorių.',
    alternates: {
      canonical: `/shou-sugi-ban/${variantSlug}`,
    },
    openGraph: {
      title: `Shou Sugi Ban: ${variantSlug}`,
      description: 'Statinis SEO puslapis su pasirinkto varianto aprašymu ir nuoroda į produkto konfigūratorių.',
      url: `${BASE_URL}/shou-sugi-ban/${variantSlug}`,
      type: 'website',
    },
  };
}

export default async function ShouSugiBanVariantLandingPage({
  params,
}: {
  params: Promise<{ variantSlug: string }>;
}) {
  const { variantSlug } = await params;

  if (!isIndexableVariantSlug(variantSlug)) {
    notFound();
  }

  return (
    <main className="w-full bg-[#E1E1E1] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[24px]">
        <h1 className="font-['DM_Sans'] text-[32px] lg:text-[48px] font-light leading-[1.0] tracking-[-1.6px] text-[#161616]">
          Shou Sugi Ban {variantSlug}
        </h1>

        <p className="mt-[12px] max-w-[820px] font-['Outfit'] text-[14px] md:text-[16px] leading-[1.6] text-[#535353]">
          Šis puslapis skirtas konkrečiam varianto užklausų ketinimui. Jame pateikiamas trumpas aprašymas ir kvietimas
          atsidaryti konfigūratorių su iš anksto parinktais nustatymais.
        </p>

        <div className="mt-[16px]">
          <Link
            href={`/products/shou-sugi-ban-wood?preset=${encodeURIComponent(variantSlug)}`}
            className="inline-flex h-[48px] px-[20px] items-center justify-center rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase"
            aria-label="Atidaryti konfigūratorių su preset"
            data-testid="variant-cta"
          >
            Konfigūruoti ir gauti pasiūlymą
          </Link>
        </div>

        <section className="mt-[32px] max-w-[820px]">
          <h2 className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">DUK</h2>
          <div className="mt-[12px] flex flex-col gap-[12px]">
            <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[16px]">
              <p className="font-['DM_Sans'] text-[16px] text-[#161616]">Ar šis puslapis yra atskiras produktas?</p>
              <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#535353]">
                Ne. Tai SEO landing puslapis, kuris nukreipia į vieną kanoninį produkto puslapį su preset.
              </p>
            </div>
            <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[16px]">
              <p className="font-['DM_Sans'] text-[16px] text-[#161616]">Ar preset URL bus indeksuojamas?</p>
              <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#535353]">
                Ne. Preset URL turi <code>noindex, follow</code> ir canonical į bazinį produkto URL be query.
              </p>
            </div>
            <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[16px]">
              <p className="font-['DM_Sans'] text-[16px] text-[#161616]">Kaip gaunamas pasiūlymas?</p>
              <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#535353]">
                Paspauskite "Gauti pasiūlymą" produkto puslapyje — bus išsiųstas konfigūracijos JSON (MVP stub).
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
