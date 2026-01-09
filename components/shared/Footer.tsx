'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { assets } from '@/lib/assets';
import { useLocale } from 'next-intl';
import { COOKIE_CONSENT_OPEN_EVENT } from '@/lib/cookies/consent';

const navColumns = [
  {
    title: 'Information',
    links: [
      { label: 'About us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Projects', href: '/projects' },
    ],
  },
  {
    title: 'For Customers',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Policies', href: '/policies' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'Facebook', href: 'https://facebook.com' },
      { label: 'Instagram', href: 'https://instagram.com' },
      { label: 'LinkedIn', href: 'https://linkedin.com' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My account', href: '/account' },
      { label: 'Shipping', href: '/policies/shipping' },
      { label: 'Refund policy', href: '/policies/refund' },
    ],
  },
];

// Certificate logos with background colors
const certificates = [
  {
    src: assets.certifications.epd,
    alt: 'EPD certification',
    bg: 'bg-white/10',
  },
  {
    src: assets.certifications.fsc,
    alt: 'FSC certification',
    bg: 'bg-white/10',
  },
  {
    src: assets.certifications.eu,
    alt: 'EU certification',
    bg: 'bg-white/10',
  },
];

const paymentMethods = ['Mastercard', 'Visa', 'Maestro', 'Stripe', 'PayPal'] as const;

export default function Footer() {
  const locale = useLocale();
  const cookieSettingsLabel = locale === 'lt' ? 'Slapukų nustatymai' : 'Cookie preferences';

  const openCookiePreferences = () => {
    window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT));
  };

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
                    <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#E1E1E1]">
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
                    <Link key={item.label} href={item.href} className="w-fit">
                      {content}
                    </Link>
                  );
                })}

                {column.title === 'For Customers' && (
                  <button
                    type="button"
                    onClick={openCookiePreferences}
                    className="w-fit text-left"
                  >
                    <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#E1E1E1]">
                      {cookieSettingsLabel}
                    </span>
                  </button>
                )}
              </nav>
            </div>
          ))}
        </div>

        {/* Certificates - Mobile: Horizontal row */}
        <div className="flex gap-[12px] mb-[32px]">
          {certificates.map((logo) => (
            <div
              key={logo.src}
              className={`w-[80px] h-[80px] rounded-[8px] flex items-center justify-center ${logo.bg}`}
            >
              <div className="relative w-[64px] h-[64px]">
                <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-[#535353] mb-[24px]" />

        {/* Copyright & Payment - Mobile */}
        <div className="flex flex-col gap-[16px]">
          <p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.2] tracking-[-0.56px] text-[#E1E1E1]">
            @2025 YAKIWOOD, LLC. All rights reserved
          </p>
          <div className="flex flex-wrap items-center gap-[12px] opacity-40">
            {paymentMethods.map((label) => (
              <span
                key={label}
                className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white/70"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] pt-[56px] pb-[32px]">
        <div className="flex flex-col gap-[40px]">
          <div className="flex items-start justify-between">
            {/* Navigation Columns - Desktop */}
            <div className="grid grid-cols-4 gap-[24px] flex-1 max-w-[1000px]">
              {navColumns.map((column) => (
                <div key={column.title}>
                  <h4 className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px] text-[#E1E1E1] mb-[12px]">
                    {column.title}
                  </h4>
                  <nav className="flex flex-col gap-[8px]">
                    {column.links.map((item) => {
                      const isExternal = item.href.startsWith('http');
                      const content = (
                        <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#E1E1E1] hover:text-white transition-colors">
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
                        <Link key={item.label} href={item.href} className="w-fit">
                          {content}
                        </Link>
                      );
                    })}

                    {column.title === 'For Customers' && (
                      <button
                        type="button"
                        onClick={openCookiePreferences}
                        className="w-fit text-left"
                      >
                        <span className="font-['Outfit'] font-light text-[14px] leading-[1.3] tracking-[0.14px] text-[#E1E1E1] hover:text-white transition-colors">
                          {cookieSettingsLabel}
                        </span>
                      </button>
                    )}
                  </nav>
                </div>
              ))}
            </div>

            {/* Certificates - Desktop */}
            <div className="flex gap-[16px] items-center">
              {certificates.map((logo) => (
                <div
                  key={logo.src}
                  className={`w-[104px] h-[104px] rounded-[8px] flex items-center justify-center ${logo.bg}`}
                >
                  <div className="relative w-[88px] h-[88px]">
                    <Image src={logo.src} alt={logo.alt} fill className="object-contain" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[#535353]" />

          {/* Copyright & Payment - Desktop */}
          <div className="flex items-center justify-between">
            <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.64px] text-[#E1E1E1]">
              @2025 YAKIWOOD, LLC. All rights reserved
            </p>

            <div className="flex items-center gap-[16px] opacity-40">
              {paymentMethods.map((label) => (
                <span
                  key={label}
                  className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white/70"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
