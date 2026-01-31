'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';
import { PageCover } from '@/components/shared/PageLayout';
import { Testimonials } from '@/components/home';
import { toLocalePath } from '@/i18n/paths';
import { assets } from '@/lib/assets';
import InView from '@/components/InView';

// Local image for the about video thumbnail
const imgVideo = '/assets/about/fire.png';
// Team images (currently unused; keep local paths to avoid expiring remote URLs)
const imgTeam1 = assets.projects[0];
const imgTeam2 = assets.projects[1];
const imgTeam3 = assets.projects[2];
const imgTeam4 = assets.projects[3];
const imgCTA = assets.ctaBackground;

export default function About() {
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const t = useTranslations('about.page');
  const showTeamSection = false;

  const heroIndent = '                            ';

  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const videoSrc = useMemo(() => {
    // Keep in sync with homepage `components/home/AboutUs.tsx`
    const base = 'https://www.youtube.com/embed/61yqRQ5lO88';
    const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1' });
    return `${base}?${params.toString()}`;
  }, []);

  useEffect(() => {
    if (!isVideoOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVideoOpen]);

  return (
    <div className="w-full bg-[#E1E1E1]">
      {/* Cover Section */}
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {t('heroTitle')}
          </h1>
        </PageCover>
      </InView>

      {/* About Us Description Section */}
      <InView className="hero-animate-root">
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[24px] md:pt-[64px] lg:pt-[96px] pb-[24px] md:pb-[0px] lg:pb-[0px]">
        <div className="relative lg:min-h-[560px]">
          {/* Big heading text with leading spaces to create indent - matches Figma exactly */}
          <p className="font-['DM_Sans'] font-light leading-[1] text-[#161616] lg:whitespace-pre-wrap m-0 hero-seq-item hero-seq-right" style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: 'clamp(-1.28px, -0.04em, -2.08px)', animationDelay: '0ms' }}>
{`${heroIndent}${t('heroLead')}`}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] md:text-[15px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full lg:max-w-[309px] mt-[32px] lg:mt-0 lg:absolute lg:bottom-0 lg:left-1/2 lg:translate-x-[96px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            {t('heroBody')}
          </p>
        </div>
      </section>
      </InView>

      {/* Video Section */}
      <InView className="hero-animate-root">
      <div className="relative md:pt-5 lg:pt-[56px]">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#161616]"></div>
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] relative z-10">
          <div className="relative h-[200px] md:h-[450px] lg:h-[642px] w-full rounded-[8px] overflow-hidden hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <Image
              src={imgVideo}
              alt={t('videoAlt')}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.2)] rounded-[100px] w-[59px] h-[59px] md:w-[100px] md:h-[100px] flex items-center justify-center z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]"
              aria-label={t('videoAria')}
            >
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                {t('videoWatch')}
              </span>
            </button>
          </div>
        </div>
      </div>
      </InView>

      {/* Foundations Section */}
      <InView className="hero-animate-root">
      <div className="bg-[#161616] pt-[64px] md:pt-[80px] lg:pt-[180px] pb-[64px] md:pb-[80px] lg:pb-[200px] w-full">
        <div className="max-w-[1440px] mx-auto pl-[16px] pr-0 md:pl-[32px] md:pr-0 lg:pl-[40px] lg:pr-0 relative">
          {/* Title */}
          <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-white lg:mt-[26px]">
              {t('foundationsEyebrow')}
            </p>
            <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[64px] lg:text-[80px] leading-none tracking-[-2px] md:tracking-[-3.2px] lg:tracking-[-4.4px] text-white lg:justify-self-start lg:max-w-[672px]">
              {t('foundationsTitlePrefix')} <span className="font-['Tiro_Tamil'] italic">{t('foundationsTitleItalic')}</span>
            </h2>
          </div>

          {/* Cards Grid - 4 columns layout matching Figma */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-[16px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            {/* Row 1: col1 bordered, col2 empty, col3 bordered, col4 no border */}
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                {t('missionTitle')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                {t('missionBody')}
              </p>
            </div>
            
            {/* Empty gap - column 2 */}
            <div className="h-[300px]"></div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                {t('visionTitle')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                {t('visionBody')}
              </p>
            </div>

            {/* No border - column 4 */}
            <div className="p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                {t('foundationsBlurbA')}
              </p>
            </div>

            {/* Row 2: col1 no border, col2 bordered, col3 bordered, col4 empty */}
            {/* No border - column 1 */}
            <div className="p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                {t('foundationsBlurbB')}
              </p>
            </div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                {t('missionTitle')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                {t('missionBody')}
              </p>
            </div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                {t('valuesTitle')}
              </p>
              <div className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueCraftsmanshipTitle')}</span><span className="font-['Outfit'] font-light text-[14px]"> – {t('valueCraftsmanshipBody')}</span>
                </p>
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueSustainabilityTitle')}</span><span className="font-['Outfit'] font-light text-[14px]"> – {t('valueSustainabilityBody')}</span>
                </p>
                <p>
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueAuthenticityTitle')}</span><span className="font-['Outfit'] font-light text-[14px]"> – {t('valueAuthenticityBody')}</span>
                </p>
              </div>
            </div>

            {/* Empty gap - column 4 */}
            <div className="h-[300px]"></div>
          </div>

          {/* Mobile Cards - horizontal scroll (left padding matches page, cards peek on 320px) */}
          <div className="lg:hidden hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            <div className="flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-[16px] pb-[8px] scrollbar-hide">
              <div className="snap-start shrink-0 w-[260px] border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                  {t('missionTitle')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                  {t('missionBody')}
                </p>
              </div>

              <div className="snap-start shrink-0 w-[260px] border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                  {t('visionTitle')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                  {t('visionBodyMobile')}
                </p>
              </div>

              <div className="snap-start shrink-0 w-[260px] border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                  {t('promiseTitle')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                  {t('promiseBody')}
                </p>
              </div>

              <div className="snap-start shrink-0 w-[260px] border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px] overflow-auto">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                  {t('valuesTitle')}
                </p>
                <div className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                  <p className="mb-[10px]">
                    <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueCraftsmanshipTitle')}</span> – {t('valueCraftsmanshipBodyMobile')}
                  </p>
                  <p className="mb-[10px]">
                    <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueSustainabilityTitle')}</span> – {t('valueSustainabilityBodyMobile')}
                  </p>
                  <p>
                    <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">{t('valueAuthenticityTitle')}</span> – {t('valueAuthenticityBodyMobile')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </InView>

      {/* Process Section */}
      <InView className="hero-animate-root">
      <div className="bg-[#E1E1E1] pt-[64px] md:pt-[80px] lg:pt-[200px] pb-[64px] md:pb-[80px] lg:pb-[80px] w-full">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px]">
          {/* Title */}
          <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] lg:mt-[26px]">
              {t('processEyebrow')}
            </p>
            <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[80px] leading-none tracking-[-2px] md:tracking-[-4.4px] text-[#161616] lg:justify-self-start lg:max-w-[767px]">
              {t('processTitlePrefix')} <span className="font-['Tiro_Tamil'] italic">{t('processTitleItalic')}</span> {t('processTitleSuffix')}
            </h2>
          </div>

          {/* Description texts - Desktop positioned to match Figma */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,344px)_minmax(0,1fr)] lg:gap-0 mb-[48px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            <div></div>
            <div className="flex gap-[68px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[276px]">
                {t('processBodyA')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[294px]">
                {t('processBodyB')}
              </p>
            </div>
          </div>

          {/* Mobile description */}
          <div className="lg:hidden mb-[32px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
              {t('processBodyMobile')}
            </p>
          </div>

          {/* Process steps - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,344px)_minmax(0,1fr)] lg:gap-0 hero-seq-item hero-seq-right" style={{ animationDelay: '360ms' }}>
            <div></div>
            <div className="w-full max-w-[672px]">
              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  {t('step1Title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  {t('step1Body')}
                </p>
              </div>

              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  {t('step2Title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  {t('step2Body')}
                </p>
              </div>

              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  {t('step3Title')}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  {t('step3Body')}
                </p>
              </div>
              <div className="border-t border-[#7C7C7C]" />
            </div>
          </div>

          {/* Process steps - Mobile */}
          <div className="lg:hidden hero-seq-item hero-seq-right" style={{ animationDelay: '360ms' }}>
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                {t('step1Title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                {t('step1Body')}
              </p>
            </div>
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                {t('step2Title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                {t('step2Body')}
              </p>
            </div>
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                {t('step3Title')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                {t('step3Body')}
              </p>
            </div>
            <div className="border-t border-[#7C7C7C]" />
          </div>
        </div>
      </div>
      </InView>

      {showTeamSection && (
        <>
          {/* Team Section */}
          <div className="bg-[#E1E1E1] pt-[64px] md:pt-[80px] lg:pt-[144px] pb-[64px] md:pb-[80px] lg:pb-[200px] w-full">
            <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px]">
              {/* Title */}
              <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] lg:mt-[26px]">
                  {t('teamEyebrow')}
                </p>
                <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[80px] leading-none tracking-[-2px] md:tracking-[-4.4px] text-[#161616] lg:justify-self-start lg:max-w-[814px]">
                  {t('teamTitlePrefix')} <span className="font-['Tiro_Tamil'] italic">{t('teamTitleItalic')}</span> {t('teamTitleSuffix')}
                </h2>
              </div>

              {/* Team Grid - Desktop */}
              <div className="hidden lg:flex gap-[16px]">
                {/* Team Member 1 */}
                <div className="flex flex-col gap-[8px] w-[328px]">
                  <div className="relative h-[434px] w-full overflow-hidden">
                    <Image
                      src={imgTeam1}
                      alt={t('teamMemberAlt')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                    {t('teamMemberName')}
                  </p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                    {t('teamMemberRole')}
                  </p>
                </div>

                {/* Team Member 2 */}
                <div className="flex flex-col gap-[8px] w-[328px]">
                  <div className="relative h-[434px] w-full overflow-hidden">
                    <Image
                      src={imgTeam2}
                      alt={t('teamMemberAlt')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                    {t('teamMemberName')}
                  </p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                    {t('teamMemberRole')}
                  </p>
                </div>

                {/* Team Member 3 */}
                <div className="flex flex-col gap-[8px] w-[328px]">
                  <div className="relative h-[434px] w-full overflow-hidden">
                    <Image
                      src={imgTeam3}
                      alt={t('teamMemberAlt')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                    {t('teamMemberName')}
                  </p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                    {t('teamMemberRole')}
                  </p>
                </div>

                {/* Team Member 4 */}
                <div className="flex flex-col gap-[8px] w-[328px]">
                  <div className="relative h-[434px] w-full overflow-hidden">
                    <Image
                      src={imgTeam4}
                      alt={t('teamMemberAlt')}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                    {t('teamMemberName')}
                  </p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                    {t('teamMemberRole')}
                  </p>
                </div>
              </div>

              {/* Team Grid - Mobile: 2 columns */}
              <div className="lg:hidden grid grid-cols-2 gap-[16px]">
                <div className="flex flex-col gap-[8px]">
                  <div className="relative h-[218px] w-full overflow-hidden">
                    <Image src={imgTeam1} alt={t('teamMemberAlt')} fill className="object-cover" />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">{t('teamMemberName')}</p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">{t('teamMemberRole')}</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="relative h-[218px] w-full overflow-hidden">
                    <Image src={imgTeam2} alt={t('teamMemberAlt')} fill className="object-cover" />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">{t('teamMemberName')}</p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">{t('teamMemberRole')}</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="relative h-[218px] w-full overflow-hidden">
                    <Image src={imgTeam3} alt={t('teamMemberAlt')} fill className="object-cover" />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">{t('teamMemberName')}</p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">{t('teamMemberRole')}</p>
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="relative h-[218px] w-full overflow-hidden">
                    <Image src={imgTeam4} alt={t('teamMemberAlt')} fill className="object-cover" />
                  </div>
                  <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">{t('teamMemberName')}</p>
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">{t('teamMemberRole')}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <Testimonials />

      {/* CTA Section */}
      <InView className="hero-animate-root">
      <div className="relative h-[523px] md:h-[1053px] w-full overflow-hidden bg-[#E1E1E1]">
        {/* Background image centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[520px] md:w-[625px] lg:w-[1099px] h-[520px] md:h-[599px] lg:h-[1053px] opacity-[0.15] mix-blend-luminosity">
            <Image
              src={imgCTA}
              alt="Background"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-[16px] md:px-[40px] h-full flex flex-col items-center justify-center">
          <p className="font-['DM_Sans'] font-light text-[45px] md:text-[128px] leading-[45px] md:leading-[0.95] tracking-[-1.8px] md:tracking-[-6.4px] text-[#161616] text-center max-w-[358px] md:max-w-[861px] mb-[32px] md:mb-[80px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            {t('ctaTitlePrefix')} <span className="font-['Tiro_Tamil'] italic">{t('ctaTitleItalic')}</span> {t('ctaTitleSuffix')}
          </p>
          <div className="flex flex-col md:flex-row gap-[16px] items-center hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            <Link
              href={toLocalePath('/products', currentLocale)}
              className="bg-[#161616] rounded-[100px] px-[40px] py-[10px] h-[48px] flex items-center justify-center"
            >
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                {t('ctaShopNow')}
              </p>
            </Link>
            <Link
              href={toLocalePath('/kontaktai', currentLocale)}
              className="border border-[#161616] rounded-[100px] px-[40px] py-[10px] h-[48px] flex items-center justify-center"
            >
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                {t('ctaGetInTouch')}
              </p>
            </Link>
          </div>
        </div>
      </div>
      </InView>

      {isVideoOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-[16px]"
          role="dialog"
          aria-modal="true"
          aria-label={t('modalLabel')}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setIsVideoOpen(false)}
            aria-label={t('modalCloseOverlay')}
          />

          <div className="relative w-full max-w-[960px] bg-black rounded-[12px] overflow-hidden shadow-2xl">
            <div className="absolute right-[12px] top-[12px] z-10">
              <button
                type="button"
                onClick={() => setIsVideoOpen(false)}
                className="h-[36px] px-[12px] rounded-[100px] bg-white/10 text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t('modalCloseButton')}
              </button>
            </div>

            <div className="relative w-full aspect-video">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={videoSrc}
                title={t('modalIframeTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
