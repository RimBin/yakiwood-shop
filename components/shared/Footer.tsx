'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
];

// MCP-hosted assets pulled straight from the Figma design
const certificates = [
  {
    src: 'https://www.figma.com/api/mcp/asset/0a0fd3de-1df1-4ccf-b448-65c419aba5cf',
    alt: 'EPD certification',
    bg: 'bg-white/10',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/453b76f9-5700-4acd-a713-d9a498d46e5c',
    alt: 'FSC certification',
    bg: 'bg-white/10',
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/4e0cb258-0b6b-4780-862f-4b782b6a14fd',
    alt: 'European Union support',
    bg: 'bg-white',
  },
];

const payments = [
  {
    src: 'https://www.figma.com/api/mcp/asset/e9fea262-02f4-4e24-accc-8ef97f1186e8',
    alt: 'Mastercard',
    width: 36,
    height: 22,
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/b4125504-97a0-4e03-b129-fe739a9bff9e',
    alt: 'Visa',
    width: 36,
    height: 12,
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/4c013541-0c2e-4f54-9c5f-f33906b58555',
    alt: 'Maestro',
    width: 40,
    height: 25,
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/c45a5013-275c-421d-add8-03996664eb8b',
    alt: 'Stripe',
    width: 53,
    height: 25,
  },
  {
    src: 'https://www.figma.com/api/mcp/asset/6d2dccad-ca60-480f-9e95-6a91a61ab095',
    alt: 'PayPal',
    width: 57,
    height: 14,
  },
];

export default function Footer() {
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
            {payments.map((pay) => (
              <Image
                key={pay.src}
                src={pay.src}
                alt={pay.alt}
                width={pay.width}
                height={pay.height}
                className="object-contain grayscale"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-[40px] pt-[56px] pb-[32px]">
        <div className="flex flex-col gap-[40px]">
          <div className="flex items-start justify-between">
            {/* Navigation Columns - Desktop */}
            <div className="grid grid-cols-3 gap-[24px] flex-1 max-w-[780px]">
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
              {payments.map((pay) => (
                <Image
                  key={pay.src}
                  src={pay.src}
                  alt={pay.alt}
                  width={pay.width}
                  height={pay.height}
                  className="object-contain grayscale"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
