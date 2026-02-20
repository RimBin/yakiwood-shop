import Link from 'next/link';
import { notFound } from 'next/navigation';
import { INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS, isIndexableVariantSlug } from '@/components/configurator/presetMap';
export const dynamic = 'force-static';

export function generateStaticParams() {
  return INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS.map((variantSlug) => ({ variantSlug }));
}

type VariantPageProps = {
  params: Promise<{ variantSlug: string }>;
};

export default async function ShouSugiBanVariantLandingPage({ params }: VariantPageProps) {
  const { variantSlug } = await params;

  if (!isIndexableVariantSlug(variantSlug)) {
    notFound();
  }

  return (
    <main className="w-full bg-[#E1E1E1]">
      <section className="mx-auto max-w-[900px] px-4 py-16 md:py-24">
        <h1 className="font-['DM_Sans'] text-[36px] md:text-[52px] leading-[1.05] tracking-[-1.6px] text-[#161616]">
          Shou Sugi Ban – {variantSlug}
        </h1>
        <div className="mt-8">
          <Link
            href={`/products/shou-sugi-ban-wood?preset=${variantSlug}`}
            data-testid="variant-cta"
            className="inline-flex h-[48px] items-center justify-center rounded-[100px] bg-[#161616] px-[32px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-white"
          >
            Konfigūruoti variantą
          </Link>
        </div>
      </section>
    </main>
  );
}
