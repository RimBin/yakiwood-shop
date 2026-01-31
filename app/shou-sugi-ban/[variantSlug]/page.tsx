import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS, isIndexableVariantSlug } from '@/components/configurator/presetMap';
import { getLocale } from 'next-intl/server';
import { canonicalUrl } from '@/lib/seo/canonical';
import { getOgImage } from '@/lib/og-image';
import { applySeoOverride } from '@/lib/seo/overrides';
import InView from '@/components/InView';

export async function generateStaticParams() {
  return INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS.map((variantSlug) => ({ variantSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ variantSlug: string }> }): Promise<Metadata> {
  const { variantSlug } = await params;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  if (!isIndexableVariantSlug(variantSlug)) {
    return {
      title: 'Variantas nerastas',
      robots: { index: false, follow: false },
    };
  }

  const canonical = canonicalUrl(`/shou-sugi-ban/${variantSlug}`, currentLocale);
  const title = currentLocale === 'lt' ? `Shou Sugi Ban: ${variantSlug}` : `Shou Sugi Ban: ${variantSlug}`;
  const description =
    currentLocale === 'lt'
      ? 'Statinis SEO puslapis su pasirinkto varianto aprašymu ir nuoroda į produkto konfigūratorių.'
      : 'Static SEO landing page for a selected variant with a link to the configurator.';

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'Yakiwood',
      images: [{ url: getOgImage('products'), width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getOgImage('products')],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
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
      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[24px]">
          <h1 className="font-['DM_Sans'] text-[32px] lg:text-[48px] font-light leading-[1.0] tracking-[-1.6px] text-[#161616] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            Shou Sugi Ban {variantSlug}
          </h1>

          <p className="mt-[12px] max-w-[820px] font-['Outfit'] text-[14px] md:text-[16px] leading-[1.6] text-[#535353] hero-seq-item hero-seq-right" style={{ animationDelay: '160ms' }}>
            Šis puslapis skirtas konkrečiam varianto užklausų ketinimui. Jame pateikiamas trumpas aprašymas ir kvietimas
            atsidaryti konfigūratorių su iš anksto parinktais nustatymais.
          </p>

          <div className="mt-[16px] hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
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
            <h2 className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C] hero-seq-item hero-seq-right" style={{ animationDelay: '480ms' }}>DUK</h2>
            <div className="mt-[12px] flex flex-col gap-[12px]">
              {[
                {
                  q: 'Ar šis puslapis yra atskiras produktas?',
                  a: 'Ne. Tai SEO landing puslapis, kuris nukreipia į vieną kanoninį produkto puslapį su preset.',
                },
                {
                  q: 'Ar preset URL bus indeksuojamas?',
                  a: 'Ne. Preset URL turi noindex, follow ir canonical į bazinį produkto URL be query.',
                },
                {
                  q: 'Kaip gaunamas pasiūlymas?',
                  a: 'Paspauskite "Gauti pasiūlymą" produkto puslapyje — bus išsiųstas konfigūracijos JSON (MVP stub).',
                },
              ].map((item, index) => (
                <div key={item.q} className="border border-[#BBBBBB] rounded-[8px] bg-white p-[16px] hero-seq-item hero-seq-right" style={{ animationDelay: `${640 + index * 140}ms` }}>
                  <p className="font-['DM_Sans'] text-[16px] text-[#161616]">{item.q}</p>
                  <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#535353]">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </InView>
    </main>
  );
}
