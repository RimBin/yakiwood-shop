import Image from 'next/image';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { getSectionPadding, getGap } from '@/lib/design-system';
import { assets } from '@/lib/assets';
import { toLocalePath } from '@/i18n/paths';

// Shared background image for CTA section
const backgroundImage = assets.ctaBackground;

export default async function CTA() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  return (
    <section className="relative w-full overflow-hidden bg-[#E1E1E1]">
      {/* Background Image with opacity and luminosity blend */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] md:w-[625px] lg:w-[1099px] h-[520px] md:h-[599px] lg:h-[1053px] opacity-[0.15] mix-blend-luminosity pointer-events-none">
        <Image src={backgroundImage} alt="" fill className="object-contain" sizes="100vw" />
      </div>

      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7625 ===== */}
      <div className={`lg:hidden relative z-10 flex flex-col items-center justify-center ${getSectionPadding()}`}>
        {/* Heading - Mobile/Tablet */}
        <h2 className="font-['DM_Sans'] font-light text-center max-w-[600px] mb-[32px] md:mb-[40px]" style={{ fontSize: 'clamp(40px, 7vw, 64px)', lineHeight: 1, letterSpacing: 'clamp(-1.8px, -0.04em, -2.56px)' }}>
          <span>Ready to </span>
          <span className="font-['Tiro_Tamil'] italic">build </span>
          <span>with fire?</span>
        </h2>

        {/* Buttons - Mobile/Tablet */}
        <div className="flex flex-col md:flex-row gap-[16px] w-full md:w-auto md:justify-center max-w-[358px] md:max-w-none">
          {/* Primary Button - GET AN OFFER */}
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="bg-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full md:w-auto md:px-[40px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              get an offer
            </span>
          </Link>

          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="border border-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              get in touch
            </span>
          </Link>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:flex relative z-10 flex-col items-center justify-center min-h-[1053px] py-[113px] px-[40px]">
        {/* Heading - Desktop */}
        <h2 className="font-['DM_Sans'] font-light text-[128px] leading-[0.95] tracking-[-6.4px] text-[#161616] text-center mb-[66px] w-[861px]">
          <span>Ready to </span>
          <span className="font-['Tiro_Tamil'] italic">build </span>
          <span>with fire?</span>
        </h2>

        {/* Action Buttons - Desktop: Side by Side */}
        <div className="flex gap-[16px] items-center justify-center">
          {/* Secondary Button - GET IN TOUCH */}
          <Link
            href={toLocalePath('/kontaktai', currentLocale)}
            className="border border-[#161616] flex items-center justify-center h-[48px] px-[40px] py-[10px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
              get in touch
            </span>
          </Link>

          {/* Primary Button - CHOOSE WOOD */}
          <Link
            href={toLocalePath('/produktai', currentLocale)}
            className="bg-[#161616] flex items-center justify-center h-[48px] px-[40px] py-[10px] rounded-[100px]"
          >
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
              Choose wood
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
