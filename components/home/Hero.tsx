import React from 'react';
import Image from 'next/image';

const imgMaskGroup = '/assets/hero/mask-group.png';
const imgProductImage = '/assets/hero/product-image.png';
const imgMastercard = '/assets/hero/mastercard.png';
const imgVisa = '/assets/hero/visa.png';
const imgStripe = '/assets/hero/stripe.png';
const imgEllipse11 = '/assets/hero/color-ellipse.png';
const imgBlackLarch = '/assets/hero/color-black-larch.png';
const imgCarbonLarch = '/assets/hero/color-carbon-larch.png';
const imgCert1 = '/assets/hero/cert1.png';
const imgCert2 = '/assets/hero/cert2.png';
const imgCert3 = '/assets/hero/cert3.png';
const imgCert4 = '/assets/hero/cert4.png';
const imgCert5 = '/assets/hero/cert5.png';
const imgCert6 = '/assets/hero/cert6.png';

const mobileColors = [imgEllipse11, imgBlackLarch, imgCarbonLarch, imgCarbonLarch, imgCarbonLarch, imgCarbonLarch];
const certificateMeta = [
  { src: imgCert1, width: 47, height: 53 },
  { src: imgCert2, width: 82, height: 25 },
  { src: imgCert3, width: 35, height: 47 },
  { src: imgCert4, width: 81, height: 42 },
  { src: imgCert5, width: 53, height: 48 },
  { src: imgCert6, width: 38, height: 27 },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#EAEAEA]">
      <Image
        src={imgMaskGroup}
        alt=""
        fill
        priority
        className="object-cover opacity-75"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#EAEAEA]/90 via-[#EAEAEA]/95 to-[#EAEAEA]" aria-hidden />

      <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 py-10 lg:py-[120px]">
        <div className="lg:hidden flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p className="font-['DM_Sans'] font-light text-[45px] leading-none tracking-[-1.8px] text-[#161616] w-full max-w-[355px] whitespace-pre-wrap">
              {`Timeless beauty, enhanced by fire – `}
              <span className="font-['Tiro_Tamil'] italic">Yakiwood</span>
            </p>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.4] tracking-[0.14px] text-[#161616] max-w-[323px]">
              Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.
            </p>

            <button className="border border-[#161616] border-solid px-[32px] py-[12px] h-[48px] rounded-[100px] flex items-center justify-center w-fit">
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">Explore catalog</span>
            </button>
          </div>

          <div className="relative w-full">
            <div className="bg-[#BEAA8F] w-full h-[423px] rounded-[36px]" />
            <div className="absolute left-0 top-4 w-full flex justify-center">
              <div className="rotate-[333deg]">
                <div className="w-[320px] h-[190px] relative">
                  <Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" />
                </div>
              </div>
            </div>

            <div className="absolute left-4 right-4 bottom-[32px] bg-white/10 backdrop-blur-[20px] border border-white/40 rounded-[16px] p-4 flex flex-col gap-4">
              <div className="flex items-start justify-between w-full text-white">
                <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px]">Shou sugi Ban Planks</p>
                <div className="flex gap-2 items-center">
                  <p className="font-['Outfit'] font-light text-[14px] tracking-[0.14px]">From</p>
                  <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px]">89 €</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-['Outfit'] font-normal text-[12px] tracking-[-0.24px] text-white">Solutions</p>
                <div className="flex gap-2 flex-wrap">
                  {['Facades', 'fence', 'terrace', 'interior'].map((label) => (
                    <div key={label} className="bg-white/40 px-3 h-[24px] rounded-[4px] flex items-center justify-center">
                      <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-['Outfit'] font-normal text-[12px] tracking-[-0.24px] text-white">Colors</p>
                <div className="flex gap-2 items-center">
                  {mobileColors.map((src, i) => (
                    <div key={i} className="w-[26px] h-[26px] rounded-[4px] relative">
                      <Image src={src} alt="" width={26} height={26} className="rounded-[4px]" />
                    </div>
                  ))}
                </div>
              </div>

              <button className="bg-white h-[48px] rounded-[100px] flex items-center justify-center w-full">
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">Buy now</span>
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-start justify-between gap-16">
          <div className="flex-1 max-w-[592px] flex flex-col gap-8">
            <p className="font-['DM_Sans'] font-light text-[80px] leading-[0.95] tracking-[-4.4px] text-[#161616] whitespace-pre-wrap">
              {`Timeless beauty, enhanced by fire – `}
              <span className="font-['Tiro_Tamil'] italic tracking-[-1.6px]">Yakiwood</span>
            </p>
            <p className="font-['Outfit'] font-light text-[18px] leading-[1.6] tracking-[0.18px] text-[#161616] max-w-[360px]">
              Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.
            </p>

            <div className="flex flex-col gap-6">
              <button className="border border-[#161616] border-solid px-[40px] py-[10px] h-[52px] rounded-[100px] flex items-center justify-center w-fit">
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">Explore catalog</span>
              </button>

              <div className="flex items-center gap-6 text-[#545454]">
                <div className="h-[23px] w-[38px] relative">
                  <Image src={imgMastercard} alt="Mastercard" fill className="object-contain" />
                </div>
                <div className="h-[12px] w-[38px] relative">
                  <Image src={imgVisa} alt="Visa" fill className="object-contain" />
                </div>
                <div className="h-[24px] w-[58px] rounded-[8px] border border-[#D5D5D5] flex items-center justify-center">
                  <span className="font-['Outfit'] text-[10px] tracking-[0.4px] uppercase text-[#5E5E5E]">Maestro</span>
                </div>
                <div className="h-[24px] w-[70px] relative">
                  <Image src={imgStripe} alt="Stripe" fill className="object-contain" />
                </div>
                <div className="h-[24px] px-4 rounded-[8px] border border-[#D5D5D5] flex items-center justify-center">
                  <span className="font-['Outfit'] text-[10px] tracking-[0.4px] uppercase text-[#5E5E5E]">PayPal</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full max-w-[640px]">
            <div className="h-[540px] rounded-[48px] bg-[#CBB498]" />
            <div className="absolute inset-x-0 top-[48px] flex justify-center">
              <div className="rotate-[333deg]">
                <div className="w-[580px] h-[336px] relative">
                  <Image src={imgProductImage} alt="Shou Sugi Ban Plank" fill className="object-cover" priority />
                </div>
              </div>
            </div>

            <div className="absolute right-[32px] bottom-[32px] bg-white/10 backdrop-blur-[24px] border border-white/50 rounded-[24px] p-6 w-[360px] flex flex-col gap-6 text-white">
              <div className="flex flex-col gap-2">
                <p className="font-['DM_Sans'] font-normal text-[24px] tracking-[-0.96px]">Shou sugi Ban Planks</p>
                <div className="flex items-center gap-2">
                  <p className="font-['Outfit'] font-light text-[16px] tracking-[0.16px]">From</p>
                  <p className="font-['DM_Sans'] font-normal text-[24px] tracking-[-0.96px]">89 €</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-['Outfit'] font-normal text-[12px] tracking-[-0.24px]">Solutions</p>
                <div className="flex gap-2 flex-wrap">
                  {['facades', 'fence', 'terrace', 'interior'].map((label) => (
                    <div key={label} className="bg-white/40 px-3 h-[24px] rounded-[4px] flex items-center justify-center">
                      <p className="font-['Outfit'] font-normal text-[10px] tracking-[0.5px] uppercase text-[#161616]">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="font-['Outfit'] font-normal text-[12px] tracking-[-0.24px]">Colors</p>
                <div className="flex -space-x-2">
                  {[imgEllipse11, imgBlackLarch, imgCarbonLarch, imgCarbonLarch, imgCarbonLarch].map((src, i) => (
                    <div key={i} className="w-[32px] h-[32px] relative">
                      <Image src={src} alt="" width={32} height={32} className="rounded-[6px]" />
                    </div>
                  ))}
                </div>
              </div>

              <button className="bg-white px-[40px] py-[10px] h-[48px] rounded-[100px] flex items-center justify-center w-full">
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">Buy now</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-[120px] w-full bg-[#161616] px-4 sm:px-6 lg:px-[72px] py-4 rounded-[20px] lg:rounded-[0px] flex flex-wrap items-center justify-center gap-8 lg:gap-[150px]">
          {certificateMeta.map(({ src, width, height }) => (
            <div key={src} className="relative" style={{ width, height }}>
              <Image src={src} alt="Certification" fill className="object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
