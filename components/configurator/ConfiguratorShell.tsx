import Link from 'next/link';
import ConfiguratorClient from './ConfiguratorClient';

export interface ConfiguratorShellProps {
  productSlug: string;
  presetSlug?: string | null;
}

export default function ConfiguratorShell({ productSlug, presetSlug }: ConfiguratorShellProps) {
  return (
    <main className="w-full bg-[#E1E1E1] min-h-screen">
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px] lg:py-[24px]">
        <div className="flex items-center gap-[8px]">
          <Link
            href="/products"
            className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353] hover:text-[#161616]"
          >
            ← Produktai
          </Link>
        </div>

        <div className="mt-[12px] flex flex-col gap-[8px]">
          <h1 className="font-['DM_Sans'] text-[28px] lg:text-[32px] font-normal leading-[1.1] tracking-[-1.28px] text-[#161616]">
            Shou Sugi Ban mediena
          </h1>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] text-[#161616] max-w-[640px]">
            Pasirinkite mediena, paskirti, spalva ir profili. Numatyta perziura yra 2D (foto), o 3D galima ijungti pasirinkus "3D".
          </p>
        </div>

        <div className="mt-[16px]">
          <ConfiguratorClient productSlug={productSlug} presetSlug={presetSlug} />
        </div>
      </div>
    </main>
  );
}
