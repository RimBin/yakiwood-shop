'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageCover } from '@/components/shared/PageLayout';
import { CTA } from '@/components/home';
import { assets, getAsset } from '@/lib/assets';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import InView from '@/components/InView';

type SolutionType = 'facades' | 'terraces' | 'interior' | 'fences';

export default function SolutionsPage() {
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<SolutionType>('facades');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const t = useTranslations('solutionsPage');

  const ModernApplicationCard = ({
    type,
  }: {
    type: SolutionType;
  }) => {
    const dataByType = {
        facades: {
          bgColor: '#EAEAEA',
          overlayOpacity: 0.06,
          eyebrow: t('facades.eyebrow'),
          title: {
            prefix: t('facades.title.prefix'),
            italic: t('facades.title.italic'),
            suffix: t('facades.title.suffix'),
          },
          description: t('facades.description'),
          specs: [
            { label: t('facades.specs.thickness.label'), value: t('facades.specs.thickness.value') },
            { label: t('facades.specs.wood.label'), value: t('facades.specs.wood.value') },
            { label: t('facades.specs.finish.label'), value: t('facades.specs.finish.value') },
          ],
          primaryCta: { href: '/kontaktai', label: t('cta.getOffer') },
          secondaryCta: { href: '/projektai', label: t('cta.seeProjects') },
          images: {
            topLeft: { src: assets.projects[2], alt: t('facades.images.topLeft') },
            topRight: { src: assets.categories.facades, alt: t('facades.images.topRight') },
            wide: { src: assets.projects[3], alt: t('facades.images.wide') },
          },
          badges: [
            { k: 'EPD', desc: t('facades.badges.epd') },
            { k: 'FSC', desc: t('facades.badges.fsc') },
            { k: 'UV', desc: t('facades.badges.uv') },
          ],
        },
        terraces: {
          bgColor: '#EFECE7',
          overlayOpacity: 0.05,
          eyebrow: t('terraces.eyebrow'),
          title: {
            prefix: t('terraces.title.prefix'),
            italic: t('terraces.title.italic'),
            suffix: t('terraces.title.suffix'),
          },
          description: t('terraces.description'),
          specs: [
            { label: t('terraces.specs.use.label'), value: t('terraces.specs.use.value') },
            { label: t('terraces.specs.feel.label'), value: t('terraces.specs.feel.value') },
            { label: t('terraces.specs.care.label'), value: t('terraces.specs.care.value') },
          ],
          primaryCta: { href: '/kontaktai', label: t('cta.getOffer') },
          secondaryCta: { href: '/produktai', label: t('cta.viewProducts') },
          images: {
            topLeft: { src: assets.categories.terrace, alt: t('terraces.images.topLeft') },
            topRight: { src: assets.projects[4], alt: t('terraces.images.topRight') },
            wide: { src: assets.projects[5], alt: t('terraces.images.wide') },
          },
          badges: [
            { k: 'GRIP', desc: t('terraces.badges.grip') },
            { k: 'DRAIN', desc: t('terraces.badges.drain') },
            { k: 'SEASON', desc: t('terraces.badges.season') },
          ],
        },
        interior: {
          bgColor: '#E9ECEF',
          overlayOpacity: 0.05,
          eyebrow: t('interior.eyebrow'),
          title: {
            prefix: t('interior.title.prefix'),
            italic: t('interior.title.italic'),
            suffix: t('interior.title.suffix'),
          },
          description: t('interior.description'),
          specs: [
            { label: t('interior.specs.applications.label'), value: t('interior.specs.applications.value') },
            { label: t('interior.specs.look.label'), value: t('interior.specs.look.value') },
            { label: t('interior.specs.design.label'), value: t('interior.specs.design.value') },
          ],
          primaryCta: { href: '/kontaktai', label: t('cta.getOffer') },
          secondaryCta: { href: '/projektai', label: t('cta.seeInteriors') },
          images: {
            topLeft: { src: assets.categories.interior, alt: t('interior.images.topLeft') },
            topRight: { src: assets.projects[1], alt: t('interior.images.topRight') },
            wide: { src: assets.projects[0], alt: t('interior.images.wide') },
          },
          badges: [
            { k: 'TEXT', desc: t('interior.badges.text') },
            { k: 'WARM', desc: t('interior.badges.warm') },
            { k: 'DETAIL', desc: t('interior.badges.detail') },
          ],
        },
        fences: {
          bgColor: '#EAEDE7',
          overlayOpacity: 0.05,
          eyebrow: t('fences.eyebrow'),
          title: {
            prefix: t('fences.title.prefix'),
            italic: t('fences.title.italic'),
            suffix: t('fences.title.suffix'),
          },
          description: t('fences.description'),
          specs: [
            { label: t('fences.specs.purpose.label'), value: t('fences.specs.purpose.value') },
            { label: t('fences.specs.build.label'), value: t('fences.specs.build.value') },
            { label: t('fences.specs.finish.label'), value: t('fences.specs.finish.value') },
          ],
          primaryCta: { href: '/kontaktai', label: t('cta.getOffer') },
          secondaryCta: { href: '/projektai', label: t('cta.seeFences') },
          images: {
            topLeft: { src: assets.categories.fence, alt: t('fences.images.topLeft') },
            topRight: { src: assets.projects[3], alt: t('fences.images.topRight') },
            wide: { src: assets.projects[2], alt: t('fences.images.wide') },
          },
          badges: [
            { k: 'LONG', desc: t('fences.badges.long') },
            { k: 'CLEAN', desc: t('fences.badges.clean') },
            { k: 'CARE', desc: t('fences.badges.care') },
          ],
        },
      };

    const data = dataByType[type];

    return (
      <div
        className="relative overflow-hidden rounded-[24px] border border-[#BBBBBB]"
        style={{ backgroundColor: data.bgColor }}
      >
        <div
          className="absolute inset-0 mix-blend-multiply pointer-events-none"
          style={{ opacity: data.overlayOpacity }}
        >
          <Image src={assets.ctaBackground} alt="" fill className="object-cover" />
        </div>

        <div className="relative p-[16px] md:p-[24px] lg:p-[40px]">
          <div className="grid gap-[24px] lg:grid-cols-[420px_1fr] lg:gap-[48px] items-start">
            <div>
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                {data.eyebrow}
              </p>

              <h4 className="mt-[16px] font-['DM_Sans'] font-light text-[36px] md:text-[44px] leading-none tracking-[-1.6px] text-[#161616]">
                {data.title.prefix}{' '}
                <span className="font-['Tiro_Tamil'] italic tracking-[-1.0px]">{data.title.italic}</span>{' '}
                {data.title.suffix}
              </h4>

              <p className="mt-[12px] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                {data.description}
              </p>

              <div className="mt-[20px] grid gap-[10px]">
                {data.specs.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between rounded-[16px] border border-[#BBBBBB] bg-white/60 px-[16px] py-[12px]"
                  >
                    <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                      {row.label}
                    </p>
                    <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[-0.28px] text-[#161616]">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-[24px] flex flex-col sm:flex-row gap-[16px] w-full sm:w-auto">
                <Link
                  href={toLocalePath(data.primaryCta.href, currentLocale)}
                  className="bg-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full sm:w-[240px] sm:px-[40px]"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                    {data.primaryCta.label}
                  </span>
                </Link>

                <Link
                  href={toLocalePath(data.secondaryCta.href, currentLocale)}
                  className="border border-[#161616] flex items-center justify-center h-[48px] rounded-[100px] w-full sm:w-[240px] sm:px-[40px]"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                    {data.secondaryCta.label}
                  </span>
                </Link>
              </div>
            </div>

            <div className="grid gap-[12px] md:gap-[16px] lg:gap-[24px]">
              <div className="grid grid-cols-2 gap-[12px] md:gap-[16px] lg:gap-[24px]">
                <div className="relative overflow-hidden rounded-[24px] h-[220px] md:h-[280px] lg:h-[320px]">
                  <Image src={data.images.topLeft.src} alt={data.images.topLeft.alt} fill className="object-cover" />
                </div>
                <div className="relative overflow-hidden rounded-[24px] h-[220px] md:h-[280px] lg:h-[320px]">
                  <Image src={data.images.topRight.src} alt={data.images.topRight.alt} fill className="object-cover" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[24px] h-[180px] md:h-[220px] lg:h-[240px]">
                <Image src={data.images.wide.src} alt={data.images.wide.alt} fill className="object-cover" />
              </div>

              <div className="grid grid-cols-3 gap-[12px] md:gap-[16px] lg:gap-[24px]">
                {data.badges.map((b) => (
                  <div key={b.k} className="rounded-[24px] border border-[#BBBBBB] bg-white/60 p-[14px]">
                    <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.1] tracking-[-0.36px] text-[#161616]">
                      {b.k}
                    </p>
                    <p className="mt-[6px] font-['Outfit'] font-light text-[12px] leading-[1.3] tracking-[0.12px] text-[#535353]">
                      {b.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const applicationNav = useMemo(
    () =>
      [
        { label: t('nav.facades'), id: 'facades' as SolutionType },
        { label: t('nav.terraces'), id: 'terraces' as SolutionType },
        { label: t('nav.interior'), id: 'interior' as SolutionType },
        { label: t('nav.fences'), id: 'fences' as SolutionType },
      ] as const,
    [t]
  );

  const scrollToSection = (id: SolutionType) => {
    setActiveFilter(id);
    setOpenAccordionIndex(0); // Reset accordion when switching tabs

    // Keep URL shareable without triggering a hard jump.
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }

    // Scroll to top of content
    const el = document.getElementById('solution-content');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const id = hash?.startsWith('#') ? hash.slice(1) : '';
    if (!id) return;
    const validIds: SolutionType[] = ['facades', 'terraces', 'interior', 'fences'];
    if (!validIds.includes(id as SolutionType)) return;

    // Wait a tick so layout is ready.
    const t = window.setTimeout(() => setActiveFilter(id as SolutionType), 0);
    return () => window.clearTimeout(t);
  }, []);

  // FAQ data for each solution type
  const faqData: Record<SolutionType, Array<{ title: string; content: string }>> = {
    facades: [
      { title: t('facades.faq.1.title'), content: t('facades.faq.1.content') },
      { title: t('facades.faq.2.title'), content: t('facades.faq.2.content') },
      { title: t('facades.faq.3.title'), content: t('facades.faq.3.content') },
      { title: t('facades.faq.4.title'), content: t('facades.faq.4.content') },
      { title: t('facades.faq.5.title'), content: t('facades.faq.5.content') },
    ],
    terraces: [
      { title: t('terraces.faq.1.title'), content: t('terraces.faq.1.content') },
      { title: t('terraces.faq.2.title'), content: t('terraces.faq.2.content') },
      { title: t('terraces.faq.3.title'), content: t('terraces.faq.3.content') },
      { title: t('terraces.faq.4.title'), content: t('terraces.faq.4.content') },
      { title: t('terraces.faq.5.title'), content: t('terraces.faq.5.content') },
    ],
    interior: [
      { title: t('interior.faq.1.title'), content: t('interior.faq.1.content') },
      { title: t('interior.faq.2.title'), content: t('interior.faq.2.content') },
      { title: t('interior.faq.3.title'), content: t('interior.faq.3.content') },
      { title: t('interior.faq.4.title'), content: t('interior.faq.4.content') },
      { title: t('interior.faq.5.title'), content: t('interior.faq.5.content') },
    ],
    fences: [
      { title: t('fences.faq.1.title'), content: t('fences.faq.1.content') },
      { title: t('fences.faq.2.title'), content: t('fences.faq.2.content') },
      { title: t('fences.faq.3.title'), content: t('fences.faq.3.content') },
      { title: t('fences.faq.4.title'), content: t('fences.faq.4.content') },
      { title: t('fences.faq.5.title'), content: t('fences.faq.5.content') },
    ],
  };

  const currentFaq = faqData[activeFilter];

  const recommendedProducts = [
    {
      id: 'rec-graphite-spruce',
      name: t('products.graphiteSpruce.name'),
      image: getAsset('finishSpruceGraphite'),
      priceTop: '28.22 €/vnt',
      profile: t('products.graphiteSpruce.profile'),
      usage: t('products.graphiteSpruce.usage'),
      price: '99 €/m²',
    },
    {
      id: 'rec-graphite-larch',
      name: t('products.graphiteLarch.name'),
      image: getAsset('finishLarchGraphite'),
      priceTop: '67.34 €/vnt',
      profile: t('products.graphiteLarch.profile'),
      usage: t('products.graphiteLarch.usage'),
      price: '129 €/m²',
    },
    {
      id: 'rec-latte-spruce',
      name: t('products.latteSpruce.name'),
      image: getAsset('finishSpruceLatte'),
      priceTop: '28.22 €/vnt',
      profile: t('products.latteSpruce.profile'),
      usage: t('products.latteSpruce.usage'),
      price: '99 €/m²',
    },
    {
      id: 'rec-latte-larch',
      name: t('products.latteLarch.name'),
      image: getAsset('finishLarchLatte'),
      priceTop: '67.34 €/vnt',
      profile: t('products.latteLarch.profile'),
      usage: t('products.latteLarch.usage'),
      price: '129 €/m²',
    },
  ];

  // Get dynamic content for active filter
  const introText = t(`${activeFilter}.intro`);
  const detailText = t(`${activeFilter}.detail`);

  return (
    <div className="bg-transparent overflow-x-hidden">
      {/* Hero Section */}
      <InView className="hero-animate-root">
        <PageCover>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-[24px] lg:gap-0 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
                style={{ fontVariationSettings: "'opsz' 14" }}>
              {t('title')}
            </h1>

            {/* Desktop Chips */}
            <div className="hidden lg:flex gap-[8px]">
              {applicationNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                    activeFilter === item.id
                      ? 'bg-[#161616] text-white'
                      : 'bg-transparent border border-[#BBBBBB] text-[#161616]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </PageCover>
      </InView>

      {/* Hero Image removed per request */}

      {/* Mobile Chips Below Header */}
      <InView className="hero-animate-root">
      <div className="lg:hidden max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[24px]">
        <div className="flex gap-[8px] flex-wrap hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            {applicationNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                  activeFilter === item.id
                    ? 'bg-[#161616] text-white'
                    : 'bg-transparent border border-[#BBBBBB] text-[#161616]'
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>
      </div>
      </InView>

      {/* Content Section */}
      <InView className="hero-animate-root">
      <section id="solution-content" className="scroll-mt-[96px] max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[32px] lg:pt-[56px] pb-[16px] lg:pb-[24px]">
        {/* Big Text - left aligned with first line indent */}
        <p className="font-['DM_Sans'] font-light text-[32px] lg:text-[52px] leading-none tracking-[-1.28px] lg:tracking-[-2.08px] text-[#161616] text-left indent-[80px] lg:indent-[200px] mb-[32px] lg:mb-[48px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          {introText}
        </p>

        {/* Small Text - offset to right on desktop */}
        <div className="lg:ml-[25%] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[557px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
          <p>{detailText}</p>
        </div>
      </section>
      </InView>

      {/* Purpose Section */}
      <InView className="hero-animate-root">
          <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[16px] lg:pt-[24px] pb-[48px] lg:pb-[72px]">
            {/* Modern Application Card */}
            <div className="mb-[48px] lg:mb-[72px] hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
              <ModernApplicationCard type={activeFilter} />
            </div>

          <div className="mt-[16px] lg:mt-[24px] grid lg:grid-cols-[25%_1fr] gap-[24px] lg:gap-0">
            <div className="hero-seq-item hero-seq-right lg:pr-[48px]" style={{ animationDelay: '420ms' }}>
              <p className="font-['Outfit'] font-normal text-[11px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353] mb-[12px]">
                {t('faqLabel')}
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] tracking-[0.14px] text-[#535353]">
                {t(`${activeFilter}.faqSubtitle`)}
              </p>
            </div>

            <div className="grid gap-[6px] lg:pl-[14px]">
              {currentFaq.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                  className="w-full text-left border-t border-[#BBBBBB] py-[16px] min-h-[52px]"
                >
                  <div className="flex items-center justify-between gap-[12px]">
                    <span className="font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616]">
                      {item.title}
                    </span>
                    <div className="w-[20px] h-[20px] relative flex items-center justify-center shrink-0 bg-[#E1E1E1]">
                      <div className="absolute inset-x-[3px] top-1/2 -translate-y-1/2 h-[1px] bg-[#161616]" />
                      {openAccordionIndex !== index && (
                        <div className="absolute left-1/2 -translate-x-1/2 w-[1px] h-[12px] bg-[#161616]" />
                      )}
                    </div>
                  </div>
                  {openAccordionIndex === index && (
                    <p className="mt-[10px] font-['Outfit'] font-light text-[14px] leading-[1.5] tracking-[0.14px] text-[#535353]">
                      {item.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>
      </InView>

      {/* Products */}
      <InView className="hero-animate-root">
        <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pb-[80px] lg:pb-[120px]">
          <div className="flex items-end justify-between mb-[24px] w-full lg:ml-[25%] lg:pl-[14px] max-w-[980px]">
            <h2 className="font-['DM_Sans'] font-light text-[32px] lg:text-[48px] leading-[1] tracking-[-1.28px] lg:tracking-[-1.92px] text-[#161616] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
              {t('productsTitle')}
            </h2>
            {/* 'View all' button removed per request */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px]">
            {recommendedProducts.map((product, index) => {
              const safeSrc = product.image?.trim() || assets.finishes.spruce.graphite || assets.wood.spruce;
              return (
                <Link
                  key={product.id}
                  href={toLocalePath('/products', currentLocale)}
                  className="hero-seq-item hero-seq-right"
                  style={{ animationDelay: `${120 + index * 80}ms` }}
                >
                  <div className="relative w-full h-[200px] lg:h-[240px] overflow-hidden rounded-[4px]">
                    <Image
                      src={safeSrc}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <span className="absolute left-[12px] top-[10px] font-['Outfit'] text-[12px] text-white drop-shadow">
                      {product.priceTop}
                    </span>
                  </div>
                  <div className="mt-[12px]">
                    <p className="font-['DM_Sans'] font-medium text-[18px] tracking-[-0.36px] text-[#161616]">
                      {product.name}
                    </p>
                    <p className="mt-[2px] font-['Outfit'] text-[11px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                      {product.profile}
                    </p>
                    <p className="mt-[6px] font-['Outfit'] text-[12px] tracking-[0.2px] text-[#535353]">
                      {product.usage}
                    </p>
                    <p className="mt-[8px] font-['DM_Sans'] font-medium text-[16px] tracking-[-0.32px] text-[#161616]">
                      {product.price}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </InView>

      <CTA />
    </div>
  );
}
