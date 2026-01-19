'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assets } from '@/lib/assets';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

// Certificate logos with background colors
const certificates = [
  {
    src: assets.certifications.epd,
    alt: 'EPD certification',
    bg: 'bg-white/10',
    mobileSize: 64,
    desktopSize: 88,
  },
  {
    src: assets.certifications.fsc,
    alt: 'FSC certification',
    bg: 'bg-white/10',
    mobileSize: 64,
    desktopSize: 88,
  },
  {
    src: assets.certifications.eu,
    alt: 'EU certification',
    bg: 'bg-white',
    mobileSize: 72,
    desktopSize: 96,
  },
];

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer.shared');
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const year = new Date().getFullYear();

  const navColumns = [
    {
      title: t('columns.information'),
      links: [
        { label: t('links.about'), href: '/about' },
        { label: t('links.contacts'), href: '/contact' },
        { label: t('links.projects'), href: '/projects' },
        { label: t('links.blog'), href: '/blog' },
      ],
    },
    {
      title: t('columns.clientCare'),
      links: [
        { label: t('links.faqs'), href: '/faq' },
        { label: t('links.policies'), href: '/policies' },
        { label: t('links.cookiePolicy'), href: '/cookie-policy' },
      ],
    },
    {
      title: t('columns.social'),
      links: [
        { label: t('links.facebook'), href: 'https://facebook.com' },
        { label: t('links.instagram'), href: 'https://instagram.com' },
        { label: t('links.linkedin'), href: 'https://linkedin.com' },
      ],
    },
    {
      title: t('columns.account'),
      links: [
        { label: t('links.myAccount'), href: '/account' },
        { label: t('links.shipping'), href: '/policies/shipping' },
        { label: t('links.refundPolicy'), href: '/policies/refund' },
      ],
    },
  ];

  const desktopNavColumns = navColumns;

  return (
    <footer className="w-full bg-[#161616]">
      {/* ===== MOBILE LAYOUT (< 1024px) - Figma 780:13408 ===== */}
      <div className="lg:hidden px-[16px] pt-[48px] pb-[32px]">
        {/* Navigation Columns - Mobile: Stacked */}
        <div className="flex flex-col gap-[32px] mb-[32px]">
          {navColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-['DM_Sans'] font-normal text-[20px] leading-[1.1] tracking-[-0.8px] text-[#E1E1E1] mb-[12px]">
                {column.title}
              </h4>
              <nav className="flex flex-col gap-[8px]">
                {column.links.map((item) => {
                  const isExternal = item.href.startsWith('http');
                  const content = (
                    <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#BBBBBB]">
                      {item.label}
                    </span>
                  );

                  if (isExternal) {
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-fit"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link key={item.label} href={toLocalePath(item.href, currentLocale)} className="w-fit">
                      {content}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Certificates - Mobile: Horizontal row */}
        <div className="flex gap-[10px] mb-[32px]">
          {certificates.map((logo) => (
            <div
              key={logo.src}
              className={`w-[76px] h-[76px] rounded-[8px] flex items-center justify-center ${logo.bg}`}
            >
              <div className="relative" style={{ width: logo.mobileSize, height: logo.mobileSize }}>
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#535353] mb-[16px]" />

        {/* Copyright & Payment - Mobile */}
        <div className="flex flex-col gap-[16px]">
          <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.2] tracking-[-0.56px] text-[#E1E1E1]">
            {t('copyright', { year })}
          </p>
          <div className="opacity-30">
            <Image
              src={assets.payments}
              alt={t('paymentsAlt')}
              width={300}
              height={18}
              className="h-[16px] w-auto"
            />
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] pt-[48px] pb-0">
        <div className="flex flex-col gap-[24px]">
          <div className="flex items-start justify-between">
            {/* Navigation Columns - Desktop */}
            <div className="flex flex-1 items-start gap-[110px] max-w-[1120px]">
              {desktopNavColumns.map((column) => (
                <div key={column.title}>
                  <h4
                    className={`font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#E1E1E1] ${
                      column.title === 'Information' ? 'mb-[16px]' : 'mb-[24px]'
                    }`}
                  >
                    {column.title}
                  </h4>
                  <nav className="flex flex-col gap-[8px]">
                    {column.links.map((item) => {
                      const isExternal = item.href.startsWith('http');
                      const content = (
                        <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#BBBBBB] hover:text-white transition-colors">
                          {item.label}
                        </span>
                      );

                      if (isExternal) {
                        return (
                          <a
                            key={item.label}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-fit"
                          >
                            {content}
                          </a>
                        );
                      }

                      return (
                        <Link key={item.label} href={toLocalePath(item.href, currentLocale)} className="w-fit">
                          {content}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}
            </div>

            {/* Certificates - Desktop */}
            <div className="flex gap-[12px] items-center">
              {certificates.map((logo) => (
                <div
                  key={logo.src}
                  className={`w-[96px] h-[96px] rounded-[8px] flex items-center justify-center ${logo.bg}`}
                >
                  <div className="relative" style={{ width: logo.desktopSize, height: logo.desktopSize }}>
                    <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright & Payment - Desktop (same row) */}
          <div className="flex items-center justify-between">
            <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.64px] text-[#E1E1E1]">
              {t('copyright', { year })}
            </p>
            <Image
              src={assets.payments}
              alt={t('paymentsAlt')}
              width={520}
              height={32}
              className="h-[30px] w-auto"
            />
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#535353]" />

          {/* Brand image - Desktop only (content width) */}
          <div className="w-full pt-[8px]">
            <Image
              src="/assets/footer/Logotipas-baltas-half.png"
              alt="Yakiwood"
              width={1440}
              height={520}
              sizes="(min-width: 1024px) 1440px, 100vw"
              className="w-full h-auto object-contain object-bottom"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
