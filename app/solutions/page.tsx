'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageCover } from '@/components/shared/PageLayout';
import { assets } from '@/lib/assets';
import { useLocale } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

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
      <PageCover>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-[24px] lg:gap-0">
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

      {/* Mobile Chips Below Header */}
      <div className="lg:hidden max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[24px]">
        <div className="flex gap-[8px] flex-wrap">
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

      {/* Content Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] py-[40px] lg:py-[80px]">
        {/* Big Text - left aligned with first line indent */}
        <p className="font-['DM_Sans'] font-light text-[32px] lg:text-[52px] leading-none tracking-[-1.28px] lg:tracking-[-2.08px] text-[#161616] text-left indent-[80px] lg:indent-[200px] mb-[32px] lg:mb-[48px]">
          Burning wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is a finish of wooden cladding that provides a modern and robust appearance.
        </p>

        {/* Small Text - offset to right on desktop */}
        <div className="lg:ml-[25%] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[557px] mb-[48px] lg:mb-[80px]">
          <p className="mb-[10px]">
            Charred wood cladding not only provides a unique appearance but is also durable and resistant to weather conditions. By properly charring the wood, a modern, nature-inspired aesthetic can be created, suitable for all architectural styles. Furthermore, charred wood serves as a natural defence against external influences, such as pests or harmful ultraviolet rays from the sun.
          </p>
          <p>Do you want to give your building a distinctive and appealing look? Encourage diverse design solutions with charred wood.</p>
        </div>

        {/* Hero Image removed (no wood background) */}
      </section>

      {/* Applications Sections (anchor targets) */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[80px] lg:pt-[120px] pb-[48px] lg:pb-[140px]">
        <div className="grid gap-[64px] lg:gap-[140px]">
          <div className="grid gap-[24px] lg:gap-[32px]">
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

          <div className="grid gap-[24px] lg:gap-[32px]">
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

          <div className="grid gap-[24px] lg:gap-[32px]">
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

          <div className="grid gap-[24px] lg:gap-[32px]">
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

      {/* Accordion Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pb-[64px] lg:pb-[80px]">
        <div className="lg:flex">
          {/* FAQ Eyebrow - left column, same width as Products offset */}
          <div className="hidden lg:block lg:w-[25%] flex-shrink-0">
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
              FAQ
            </span>
          </div>

          {/* Accordion - right column, aligned with Products */}
          <div className="lg:w-[75%]">
            {/* Mobile eyebrow */}
            <div className="lg:hidden mb-[24px]">
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                FAQ
              </span>
            </div>

            {accordionData.map((item, index) => (
              <div key={index}>
                <div className="h-[1px] bg-[#BBBBBB] my-[8px]" />
              
              <button
                onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-[4px] cursor-pointer bg-transparent border-none text-left"
              >
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                  {item.title}
                </span>
                
                <div className="w-[20px] h-[20px] relative flex items-center justify-center">
                  <div className="absolute w-[13.75px] h-[1px] bg-[#161616]" />
                  <div
                    className={`absolute w-[1px] h-[13.75px] bg-[#161616] transition-transform duration-200 ${
                      openAccordionIndex === index ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {openAccordionIndex === index && (
                <div className="pt-[8px] pb-[4px]">
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[672px] whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div className="h-[1px] bg-[#BBBBBB] my-[8px]" />
        </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pb-[80px] lg:pb-[120px]">
        <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-3.2px] text-[#161616] mb-[40px] lg:mb-[64px] lg:ml-[25%]">
          Products
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {products.map((product, index) => (
            <div
              key={index}
              className="border border-[#BBBBBB] rounded-[8px] p-[16px] flex flex-col gap-[16px] lg:w-[328px]"
            >
              <div className="relative w-full h-[250px] rounded-[8px] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col gap-[4px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {product.name}
                </p>
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353]">
                  {product.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[120px] lg:pt-[200px] pb-[200px] lg:pb-[350px] relative">
        {/* Background Image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[625px] lg:w-[1099px] h-[599px] lg:h-[1053px] opacity-15 mix-blend-luminosity pointer-events-none">
          <Image
            src={assets.ctaBackground}
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* CTA Content */}
        <div className="relative z-10 flex flex-col items-center gap-[40px] lg:gap-[64px]">
          <h2 className="font-['DM_Sans'] font-light text-[45px] lg:text-[128px] leading-[0.95] tracking-[-1.8px] lg:tracking-[-6.4px] text-[#161616] text-center max-w-[358px] lg:max-w-[861px] m-0">
            Ready to{' '}
            <span className="font-['Tiro_Tamil'] italic">build</span>{' '}
            with fire?
          </h2>

          <div className="flex flex-col lg:flex-row gap-[16px] items-center w-full lg:w-auto">
            <button className="h-[48px] px-[40px] bg-[#161616] rounded-[100px] border-none font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase text-white cursor-pointer transition-colors hover:bg-[#2a2a2a] w-full lg:w-auto">
              Get an offer
            </button>

            <button className="h-[48px] px-[40px] bg-transparent border border-[#161616] rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase text-[#161616] cursor-pointer transition-all hover:bg-[#161616] hover:text-white w-full lg:w-auto">
              Get in touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
