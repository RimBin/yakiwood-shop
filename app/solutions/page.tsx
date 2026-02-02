'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageCover } from '@/components/shared/PageLayout';
import { assets } from '@/lib/assets';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import InView from '@/components/InView';

export default function SolutionsPage() {
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState('Facades');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const ModernApplicationCard = ({
    type,
  }: {
    type: 'facades' | 'terraces' | 'interior' | 'fences';
  }) => {
    const dataByType = {
        facades: {
          bgColor: '#EAEAEA',
          overlayOpacity: 0.06,
          eyebrow: 'Facades / Quick spec',
          title: {
            prefix: 'Designed to',
            italic: 'last',
            suffix: 'outside',
          },
          description:
            'A modern, ventilated facade system with charred wood cladding — built for the Baltic climate, minimal maintenance, and a clean architectural finish.',
          specs: [
            { label: 'Thickness', value: '18/20 mm' },
            { label: 'Wood', value: 'Larch / Spruce' },
            { label: 'Finish', value: 'Matte, UV stable' },
          ],
          primaryCta: { href: '/kontaktai', label: 'get an offer' },
          secondaryCta: { href: '/projects', label: 'see projects' },
          images: {
            topLeft: { src: assets.projects[2], alt: 'Facade project detail' },
            topRight: { src: assets.categories.facades, alt: 'Charred wood facade' },
            wide: { src: assets.projects[3], alt: 'Facade board texture' },
          },
          badges: [
            { k: 'EPD', desc: 'Environmental Product Declaration' },
            { k: 'FSC', desc: 'Responsible forestry' },
            { k: 'UV', desc: 'Fade resistance' },
          ],
        },
        terraces: {
          bgColor: '#EFECE7',
          overlayOpacity: 0.05,
          eyebrow: 'Terraces / Quick spec',
          title: {
            prefix: 'Made for',
            italic: 'comfort',
            suffix: 'outdoors',
          },
          description:
            'Fire-treated decking with natural grip and a refined texture. Built to handle seasonal changes while staying beautiful underfoot.',
          specs: [
            { label: 'Use', value: 'Decking / terraces' },
            { label: 'Feel', value: 'Natural texture, stable' },
            { label: 'Care', value: 'Low maintenance' },
          ],
          primaryCta: { href: '/kontaktai', label: 'get an offer' },
          secondaryCta: { href: '/products', label: 'view products' },
          images: {
            topLeft: { src: assets.categories.terrace, alt: 'Terrace decking' },
            topRight: { src: assets.projects[4], alt: 'Terrace project' },
            wide: { src: assets.projects[5], alt: 'Decking detail' },
          },
          badges: [
            { k: 'GRIP', desc: 'Confident footing' },
            { k: 'DRAIN', desc: 'Ventilated system' },
            { k: 'SEASON', desc: 'Weather-ready' },
          ],
        },
        interior: {
          bgColor: '#E9ECEF',
          overlayOpacity: 0.05,
          eyebrow: 'Interior / Quick spec',
          title: {
            prefix: 'Bring',
            italic: 'depth',
            suffix: 'inside',
          },
          description:
            'Charred wood panels for modern interiors — warmth, contrast, and texture for feature walls, ceilings, and details.',
          specs: [
            { label: 'Applications', value: 'Walls / ceilings' },
            { label: 'Look', value: 'Rich texture, matte' },
            { label: 'Design', value: 'Custom patterns' },
          ],
          primaryCta: { href: '/kontaktai', label: 'get an offer' },
          secondaryCta: { href: '/projects', label: 'see interiors' },
          images: {
            topLeft: { src: assets.categories.interior, alt: 'Interior wall panels' },
            topRight: { src: assets.projects[1], alt: 'Interior project detail' },
            wide: { src: assets.projects[0], alt: 'Panel texture detail' },
          },
          badges: [
            { k: 'TEXT', desc: 'Tactile surface' },
            { k: 'WARM', desc: 'Natural ambience' },
            { k: 'DETAIL', desc: 'Architectural finish' },
          ],
        },
        fences: {
          bgColor: '#EAEDE7',
          overlayOpacity: 0.05,
          eyebrow: 'Fences / Quick spec',
          title: {
            prefix: 'Privacy with',
            italic: 'style',
            suffix: 'built in',
          },
          description:
            'Charred wood fencing that stays stable, looks premium, and withstands the elements — for clean lines and long-term durability.',
          specs: [
            { label: 'Purpose', value: 'Privacy / boundaries' },
            { label: 'Build', value: 'Strong & stable' },
            { label: 'Finish', value: 'Distinct charred look' },
          ],
          primaryCta: { href: '/kontaktai', label: 'get an offer' },
          secondaryCta: { href: '/projects', label: 'see fences' },
          images: {
            topLeft: { src: assets.categories.fence, alt: 'Charred wood fence' },
            topRight: { src: assets.projects[3], alt: 'Fence project' },
            wide: { src: assets.projects[2], alt: 'Fence detail' },
          },
          badges: [
            { k: 'LONG', desc: 'Built to endure' },
            { k: 'CLEAN', desc: 'Minimal silhouette' },
            { k: 'CARE', desc: 'Low upkeep' },
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

              <div className="mt-[24px] flex flex-col sm:flex-row gap-[12px]">
                <Link
                  href={toLocalePath(data.primaryCta.href, currentLocale)}
                  className="bg-[#161616] h-[48px] px-[40px] rounded-[100px] flex items-center justify-center"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                    {data.primaryCta.label}
                  </span>
                </Link>

                <Link
                  href={toLocalePath(data.secondaryCta.href, currentLocale)}
                  className="group border border-[#161616] h-[48px] px-[40px] rounded-[100px] flex items-center justify-center hover:bg-[#161616] transition-colors"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] group-hover:text-white transition-colors">
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

  const ApplicationSection = ({
    id,
    title,
    description,
    bullets,
    images,
    reverse = false,
  }: {
    id: string;
    title: string;
    description: string;
    bullets: string[];
    images: Array<{ src: string; alt: string }>;
    reverse?: boolean;
  }) => {
    const isSingleImage = images.length === 1;
    const isFacades = id === 'facades';
    const imageGridClass = isFacades
      ? 'grid grid-cols-2 lg:grid-cols-[240px_320px] gap-[12px] md:gap-[16px] lg:gap-[24px] w-full lg:w-[584px]'
      : (isSingleImage ? 'grid grid-cols-1 ' : 'grid grid-cols-2 ') +
        'gap-[12px] md:gap-[16px] lg:gap-[24px] w-full lg:w-[520px]';
    const imageHeightClass = isFacades
      ? 'h-[180px] md:h-[240px] lg:h-[300px]'
      : isSingleImage
        ? 'h-[220px] md:h-[320px] lg:h-[240px]'
        : 'h-[160px] md:h-[220px] lg:h-[240px]';
    const titleClass = isFacades
      ? "font-['DM_Sans'] font-light text-[40px] leading-none tracking-[-1.6px] text-[#161616]"
      : "font-['DM_Sans'] font-light text-[32px] lg:text-[48px] leading-none tracking-[-1.28px] lg:tracking-[-1.92px] text-[#161616]";
    const descriptionClass = isFacades
      ? "mt-[12px] font-['Outfit'] font-light text-[12px] leading-[1.35] tracking-[0.12px] text-[#535353]"
      : "mt-[12px] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]";
    const listClass = isFacades
      ? "mt-[16px] grid gap-[12px] font-['Outfit'] font-light text-[12px] leading-[1.35] tracking-[0.12px] text-[#535353]"
      : "mt-[16px] grid gap-[10px] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]";

    return (
      <div id={id} className={`scroll-mt-[96px] ${isFacades ? 'py-[48px] lg:py-[96px]' : ''}`}>
        <div
          className={
            `flex flex-col lg:flex-row ${isFacades ? 'items-start' : 'items-center'} ` +
            (reverse ? 'lg:flex-row-reverse ' : '') +
            'gap-[20px] md:gap-[28px] lg:gap-[120px]'
          }
        >
          <div className={imageGridClass}>
            {images.map((img, idx) => (
              <div
                key={`${img.src}-${idx}`}
                className={
                  `relative w-full overflow-hidden ${isFacades ? 'rounded-[16px]' : 'rounded-[24px]'} ${imageHeightClass}` +
                  (isFacades && idx === 1 ? ' lg:mt-[12px]' : '')
                }
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className={`w-full ${isFacades ? 'lg:max-w-[360px]' : 'lg:max-w-[420px]'}`}>
            <h3 className={titleClass}>
              {title}
            </h3>
            <p className={descriptionClass}>
              {description}
            </p>
            <ul className={listClass}>
              {bullets.map((b) => (
                <li key={b}>— {b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const applicationNav = useMemo(
    () =>
      [
        { label: 'Facades', id: 'facades' },
        { label: 'Terraces', id: 'terraces' },
        { label: 'Interior', id: 'interior' },
        { label: 'Fences', id: 'fences' },
      ] as const,
    []
  );

  const scrollToSection = (id: string, label?: string) => {
    setActiveFilter(label ?? id);

    const el = document.getElementById(id);
    if (!el) return;

    // Keep URL shareable without triggering a hard jump.
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`);
    }

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const id = hash?.startsWith('#') ? hash.slice(1) : '';
    if (!id) return;
    const exists = applicationNav.some((x) => x.id === id);
    if (!exists) return;

    // Wait a tick so layout is ready.
    const t = window.setTimeout(() => scrollToSection(id), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationNav]);

  const products = [
    { name: 'Yakiwood Black', type: 'Larch', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Charcoal', type: 'Pine', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Natural', type: 'Spruce', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Deep', type: 'Oak', image: '/images/solutions/product-1.jpg' },
  ];

  const accordionData = [
    {
      title: 'Introduction to Burnt Wood Facade Cladding',
      content: `Burnt wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is wooden facade cladding that provides a modern and robust appearance. This article, "Burnt Wood for Facades: A Modern and Durable Choice," presents the advantages of burnt wood facade cladding and offers recommendations on how to incorporate this technique into your projects.

Burnt wood not only provides a unique look but is also durable and weather-resistant. Wrapping wood with burnt wood facade cladding can recreate an ancient, natural appearance that is adaptable to all architectural styles. Additionally, burnt wood serves as a natural protection against external factors such as pests and harmful ultraviolet rays from the sun.

Do you want to give your building a distinctive and attractive appearance? Encourage various design solutions with burnt wood. Read this article to learn more about the benefits of burnt wood facades and tips on how to implement it in your projects.`,
    },
    {
      title: 'Advantages of Burnt Wood Facade Cladding',
      content: 'Burnt wood facade cladding offers numerous benefits including enhanced durability, natural weather resistance, and a distinctive aesthetic appeal.',
    },
    {
      title: 'Most Popular Wood Types for Burnt Wood Facade Cladding',
      content: 'Common wood types used for burnt wood cladding include larch, pine, spruce, and oak, each offering unique characteristics and visual appeal.',
    },
    {
      title: 'Installation Process of Burnt Wood Facade Cladding',
      content: 'The installation process involves proper surface preparation, selecting the right mounting system, and ensuring adequate ventilation behind the cladding.',
    },
    {
      title: 'Cost Aspects of Burnt Wood Facade Cladding',
      content: 'While initial costs may be higher than traditional options, the long-term durability and low maintenance requirements make burnt wood an economical choice.',
    },
    {
      title: 'Sustainability and Environmental Protection of Burnt Wood Facade Cladding',
      content: 'Burnt wood is an environmentally friendly option, using natural preservation methods and often sourced from sustainably managed forests.',
    },
    {
      title: 'Conclusion: Is Burnt Wood Board Facade Cladding the Right Choice for Your Project?',
      content: 'Consider your aesthetic preferences, budget, and long-term maintenance plans when deciding if burnt wood cladding is the right choice for your project.',
    },
  ];

  return (
    <div className="bg-transparent">
      {/* Hero Section */}
      <InView className="hero-animate-root">
        <PageCover>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-[24px] lg:gap-0 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
                style={{ fontVariationSettings: "'opsz' 14" }}>
              Solutions
            </h1>

            {/* Desktop Chips */}
            <div className="hidden lg:flex gap-[8px]">
              {applicationNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id, item.label)}
                  className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                    activeFilter === item.label
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

      {/* Mobile Chips Below Header */}
      <InView className="hero-animate-root">
      <div className="lg:hidden max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[24px]">
        <div className="flex gap-[8px] flex-wrap hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            {applicationNav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id, item.label)}
                className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                  activeFilter === item.label
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
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] py-[40px] lg:py-[80px]">
        {/* Big Text - left aligned with first line indent */}
        <p className="font-['DM_Sans'] font-light text-[32px] lg:text-[52px] leading-none tracking-[-1.28px] lg:tracking-[-2.08px] text-[#161616] text-left indent-[80px] lg:indent-[200px] mb-[32px] lg:mb-[48px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          Burning wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is a finish of wooden cladding that provides a modern and robust appearance.
        </p>

        {/* Small Text - offset to right on desktop */}
        <div className="lg:ml-[25%] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[557px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
          <p className="mb-[10px]">
            Charred wood cladding not only provides a unique appearance but is also durable and resistant to weather conditions. By properly charring the wood, a modern, nature-inspired aesthetic can be created, suitable for all architectural styles. Furthermore, charred wood serves as a natural defence against external influences, such as pests or harmful ultraviolet rays from the sun.
          </p>
          <p>Do you want to give your building a distinctive and appealing look? Encourage diverse design solutions with charred wood.</p>
        </div>
      </section>
      </InView>

      {/* Enhanced Visual Transition Section */}
      <InView className="hero-animate-root">
        <section className="relative w-full py-[80px] lg:py-[120px] overflow-hidden bg-gradient-to-b from-transparent via-[#F5F5F5] to-transparent">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#161616] blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#161616] blur-[120px]" />
          </div>

          <div className="relative max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px]">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-[48px] lg:gap-[80px] items-center">
              {/* Left: Tagline & CTA */}
              <div className="hero-seq-item hero-seq-left" style={{ animationDelay: '0ms' }}>
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353] mb-[16px]">
                  Discover the possibilities
                </p>
                
                <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[64px] leading-[0.95] tracking-[-1.6px] lg:tracking-[-2.56px] text-[#161616] mb-[24px]">
                  Four ways to{' '}
                  <span className="font-['Tiro_Tamil'] italic">transform</span>{' '}
                  your space
                </h2>
                
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[480px] mb-[32px]">
                  From exterior facades to interior accents, our charred wood solutions bring character, durability, and timeless beauty to every project.
                </p>

                <button
                  onClick={() => scrollToSection('facades', 'Facades')}
                  className="group inline-flex items-center gap-[12px] h-[56px] px-[32px] bg-[#161616] rounded-[100px] hover:bg-[#2a2a2a] transition-all cursor-pointer border-none"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                    Explore Applications
                  </span>
                  <div className="w-[20px] h-[20px] rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="group-hover:translate-y-[1px] transition-transform">
                      <path d="M5 1L5 9M5 9L1 5M5 9L9 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
              </div>

              {/* Right: Application Cards Grid */}
              <div className="grid grid-cols-2 gap-[16px] lg:gap-[20px]">
                {[
                  { id: 'facades', label: 'Facades', icon: '🏢' },
                  { id: 'terraces', label: 'Terraces', icon: '🌳' },
                  { id: 'interior', label: 'Interior', icon: '🏠' },
                  { id: 'fences', label: 'Fences', icon: '🚧' }
                ].map((app, idx) => (
                  <button
                    key={app.id}
                    onClick={() => scrollToSection(app.id, app.label)}
                    className="group relative overflow-hidden rounded-[24px] border border-[#BBBBBB] bg-white hover:bg-[#161616] transition-all cursor-pointer p-[24px] lg:p-[32px] flex flex-col items-start justify-end h-[160px] lg:h-[200px] hero-seq-item hero-seq-right"
                    style={{ animationDelay: `${200 + idx * 100}ms` }}
                  >
                    {/* Hover Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#161616]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Icon */}
                    <div className="text-[32px] lg:text-[40px] mb-[16px] transform group-hover:scale-110 transition-transform">
                      {app.icon}
                    </div>
                    
                    {/* Label */}
                    <div className="relative z-10">
                      <p className="font-['DM_Sans'] font-medium text-[18px] lg:text-[20px] leading-[1.1] tracking-[-0.36px] text-[#161616] group-hover:text-white transition-colors mb-[4px]">
                        {app.label}
                      </p>
                      <div className="flex items-center gap-[6px] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-white">
                          Learn more
                        </span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Scroll Indicator */}
            <div className="flex justify-center mt-[64px] lg:mt-[96px] hero-seq-item hero-seq-up" style={{ animationDelay: '800ms' }}>
              <div className="flex flex-col items-center gap-[8px]">
                <div className="h-[40px] w-[1px] bg-gradient-to-b from-transparent via-[#BBBBBB] to-transparent" />
                <div className="w-[6px] h-[6px] rounded-full bg-[#BBBBBB] animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
            </div>
          </div>
        </section>
      </InView>

      {/* Applications Sections (anchor targets) */}
      <InView className="hero-animate-root">
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[80px] lg:pt-[120px] pb-[48px] lg:pb-[140px]">
        <div className="grid gap-[64px] lg:gap-[140px]">
          <div className="grid gap-[24px] lg:gap-[32px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <ApplicationSection
              id="facades"
              title="Facades"
              description="For ventilated cladding, charred larch or spruce offers excellent weather resistance and a timeless, matte finish. Recommended thickness: 18/20 mm."
              bullets={['Moisture & UV resistant', 'Certifications: EPD, FSC']}
              images={[
                { src: assets.projects[0], alt: 'Facades project example' },
                { src: assets.projects[1], alt: 'Facades project detail example' },
              ]}
            />
            <ModernApplicationCard type="facades" />
          </div>

          <div className="grid gap-[24px] lg:gap-[32px] hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
            <ApplicationSection
              id="terraces"
              title="Terraces"
              description="Fire-treated decking that’s built for outdoor living, with natural grip and a premium feel."
              bullets={['Durable surface for high traffic', 'Natural texture and warmth', 'Designed for seasonal changes']}
              images={[
                { src: assets.categories.terrace, alt: 'Terraces example' },
                { src: assets.categories.terrace, alt: 'Terraces detail example' },
              ]}
              reverse
            />
            <ModernApplicationCard type="terraces" />
          </div>

          <div className="grid gap-[24px] lg:gap-[32px] hero-seq-item hero-seq-right" style={{ animationDelay: '400ms' }}>
            <ApplicationSection
              id="interior"
              title="Interior"
              description="Add depth and sophistication indoors with charred wood panels and feature walls."
              bullets={['Warm, modern materiality', 'Unique patterning and tone', 'Works for walls, ceilings, details']}
              images={[
                { src: assets.categories.interior, alt: 'Interior example' },
                { src: assets.categories.interior, alt: 'Interior detail example' },
              ]}
            />
            <ModernApplicationCard type="interior" />
          </div>

          <div className="grid gap-[24px] lg:gap-[32px] hero-seq-item hero-seq-right" style={{ animationDelay: '600ms' }}>
            <ApplicationSection
              id="fences"
              title="Fences"
              description="Privacy with style — elegant fencing that endures and elevates outdoor spaces."
              bullets={['Strong, stable, and durable', 'Distinctive charred finish', 'Great for modern landscapes']}
              images={[{ src: assets.categories.fence, alt: 'Fences example' }]}
              reverse
            />
            <ModernApplicationCard type="fences" />
          </div>
        </div>
      </section>
      </InView>

      {/* FAQ Section - Modern Cards */}
      <InView className="hero-animate-root">
        <section className="w-full bg-white py-[80px] lg:py-[120px]">
          <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px]">
            <div className="mb-[48px] lg:mb-[64px] hero-seq-item hero-seq-up" style={{ animationDelay: '0ms' }}>
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353] mb-[16px]">
                Common Questions
              </p>
              <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[64px] leading-[0.9] tracking-[-1.6px] lg:tracking-[-2.56px] text-[#161616]">
                Everything you need to know
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-[16px] lg:gap-[24px]">
              {accordionData.slice(0, 4).map((item, index) => (
                <button
                  key={index}
                  onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                  className={`group text-left p-[24px] lg:p-[32px] rounded-[24px] border transition-all hero-seq-item hero-seq-up ${
                    openAccordionIndex === index 
                      ? 'bg-[#161616] border-[#161616]' 
                      : 'bg-white border-[#E1E1E1] hover:border-[#BBBBBB]'
                  }`}
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <div className="flex items-start justify-between gap-[16px] mb-[16px]">
                    <h3 className={`font-['DM_Sans'] font-medium text-[18px] lg:text-[20px] leading-[1.2] tracking-[-0.4px] transition-colors ${
                      openAccordionIndex === index ? 'text-white' : 'text-[#161616]'
                    }`}>
                      {item.title}
                    </h3>
                    <div className={`w-[24px] h-[24px] rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      openAccordionIndex === index ? 'bg-white/20 rotate-45' : 'bg-[#E1E1E1] group-hover:bg-[#D1D1D1]'
                    }`}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 2V10M2 6H10" stroke={openAccordionIndex === index ? 'white' : '#161616'} strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                  <div className={`overflow-hidden transition-all ${
                    openAccordionIndex === index ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <p className="font-['Outfit'] font-light text-[14px] leading-[1.6] tracking-[0.14px] text-white/80">
                      {item.content}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      </InView>

      {/* Featured Products Showcase */}
      <InView className="hero-animate-root">
        <section className="w-full bg-gradient-to-b from-[#FAFAFA] to-white py-[80px] lg:py-[120px]">
          <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px]">
            <div className="text-center mb-[48px] lg:mb-[64px] hero-seq-item hero-seq-up" style={{ animationDelay: '0ms' }}>
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353] mb-[16px]">
                Our Range
              </p>
              <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[64px] leading-[0.9] tracking-[-1.6px] lg:tracking-[-2.56px] text-[#161616]">
                Featured{' '}<span className="font-['Tiro_Tamil'] italic">Products</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[24px]">
              {products.map((product, index) => (
                <Link
                  key={index}
                  href={toLocalePath('/products', currentLocale)}
                  className="group relative overflow-hidden rounded-[24px] border border-[#E1E1E1] hover:border-[#161616] transition-all hero-seq-item hero-seq-up"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <div className="relative h-[320px] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161616]/80 via-[#161616]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-[24px]">
                    <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616] mb-[4px] group-hover:text-[#161616] transition-colors">
                      {product.name}
                    </p>
                    <p className="font-['Outfit'] font-normal text-[11px] leading-[1.3] tracking-[0.55px] uppercase text-[#535353] mb-[16px]">
                      {product.type}
                    </p>
                    <div className="flex items-center gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-['Outfit'] font-normal text-[10px] leading-[1.2] tracking-[0.5px] uppercase text-[#161616]">
                        View Details
                      </span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6H10M10 6L6 2M10 6L6 10" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-[48px] hero-seq-item hero-seq-up" style={{ animationDelay: '800ms' }}>
              <Link
                href={toLocalePath('/products', currentLocale)}
                className="inline-flex items-center justify-center h-[52px] px-[40px] border border-[#161616] rounded-[100px] hover:bg-[#161616] group transition-all"
              >
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] group-hover:text-white transition-colors">
                  View All Products
                </span>
              </Link>
            </div>
          </div>
        </section>
      </InView>

      {/* Final CTA - Dramatic */}
      <InView className="hero-animate-root">
        <section className="relative w-full py-[120px] lg:py-[200px] overflow-hidden bg-[#161616]">
          {/* Ambient Background */}
          <div className="absolute inset-0 opacity-20">
            <Image
              src={assets.ctaBackground}
              alt=""
              fill
              className="object-cover mix-blend-overlay"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#161616] via-transparent to-[#161616]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#161616]/40 via-transparent to-[#161616]/40" />

          <div className="relative z-10 max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-[32px] hero-seq-item hero-seq-up" style={{ animationDelay: '0ms' }}>
                <div className="inline-block px-[20px] py-[10px] rounded-[100px] bg-white/10 backdrop-blur-sm">
                  <span className="font-['Outfit'] font-normal text-[10px] leading-[1.3] tracking-[0.5px] uppercase text-white/80">
                    Start Your Project Today
                  </span>
                </div>
              </div>

              <h2 className="font-['DM_Sans'] font-light text-[48px] lg:text-[96px] leading-[0.9] tracking-[-1.92px] lg:tracking-[-3.84px] text-white max-w-[900px] mb-[32px] hero-seq-item hero-seq-up" style={{ animationDelay: '100ms' }}>
                Ready to{' '}
                <span className="font-['Tiro_Tamil'] italic">transform</span>
                <br className="hidden lg:block" />
                your space?
              </h2>

              <p className="font-['Outfit'] font-light text-[16px] leading-[1.6] tracking-[0.16px] text-white/70 max-w-[600px] mb-[48px] hero-seq-item hero-seq-up" style={{ animationDelay: '200ms' }}>
                Get expert guidance on charred wood solutions for your next project. Our team is ready to help you choose the perfect application and finish.
              </p>

              <div className="flex flex-col sm:flex-row gap-[16px] items-center hero-seq-item hero-seq-up" style={{ animationDelay: '300ms' }}>
                <Link
                  href={toLocalePath('/kontaktai', currentLocale)}
                  className="group inline-flex items-center justify-center h-[56px] px-[40px] bg-white rounded-[100px] hover:bg-white/90 transition-all"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                    Get an Offer
                  </span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-[8px] group-hover:translate-x-[2px] transition-transform">
                    <path d="M3 8H13M13 8L8 3M13 8L8 13" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                <Link
                  href={toLocalePath('/projects', currentLocale)}
                  className="inline-flex items-center justify-center h-[56px] px-[40px] border-2 border-white/30 rounded-[100px] hover:border-white hover:bg-white/10 transition-all"
                >
                  <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                    View Projects
                  </span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-[32px] lg:gap-[64px] mt-[80px] hero-seq-item hero-seq-up" style={{ animationDelay: '400ms' }}>
                {[
                  { label: 'Projects', value: '200+' },
                  { label: 'Experience', value: '10Y' },
                  { label: 'Quality', value: '100%' }
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-['DM_Sans'] font-light text-[32px] lg:text-[48px] leading-[0.9] tracking-[-1.28px] lg:tracking-[-1.92px] text-white mb-[8px]">
                      {stat.value}
                    </p>
                    <p className="font-['Outfit'] font-normal text-[10px] leading-[1.3] tracking-[0.5px] uppercase text-white/60">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </InView>
    </div>
  );
}
