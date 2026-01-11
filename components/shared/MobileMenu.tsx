'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const locale = useLocale();
  const t = useTranslations();

  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const configuratorLink = {
    href: toLocalePath('/configurator3d', currentLocale),
    label: t(locale === 'lt' ? 'nav.konfiguratorius3d' : 'nav.configurator3d'),
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#161616] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full px-[24px] py-[24px]">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-[48px]">
            <div className="w-[40px]" />
            <button
              onClick={onClose}
              className="w-[48px] h-[48px] rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-[24px] mb-auto">
            <Link
              href={toLocalePath('/account', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Account
            </Link>
            <Link
              href={toLocalePath('/products', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Products
            </Link>
            <Link
              href={toLocalePath('/solutions', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Solutions
            </Link>
            <Link
              href={toLocalePath('/projects', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Projects
            </Link>

            <Link
              href={configuratorLink.href}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              {configuratorLink.label}
            </Link>
            <Link
              href={toLocalePath('/about', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              About us
            </Link>
            <Link
              href={toLocalePath('/contact', currentLocale)}
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Contact
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="flex flex-col gap-[32px] pt-[32px] border-t border-white/20">
            {/* CTA Button - Figma: border only, not filled */}
            <button className="w-full max-w-[357px] mx-auto border border-[#535353] rounded-[100px] h-[48px] flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                Get in touch
              </span>
            </button>

            {/* Social Links - Figma: 24px font size */}
            <div className="flex items-center justify-center gap-[32px]">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-['DM_Sans'] font-light text-[24px] leading-[1.2] tracking-[-0.96px] text-white hover:opacity-70 transition-opacity"
              >
                Facebook
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-['DM_Sans'] font-light text-[24px] leading-[1.2] tracking-[-0.96px] text-white hover:opacity-70 transition-opacity"
              >
                Instagram
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-['DM_Sans'] font-light text-[24px] leading-[1.2] tracking-[-0.96px] text-white hover:opacity-70 transition-opacity"
              >
                LinkedIn
              </a>
            </div>

            {/* Payment Icons */}
            <div className="flex flex-wrap items-center justify-center gap-[16px] opacity-40">
              {['Mastercard', 'Visa', 'Maestro', 'Stripe', 'PayPal'].map((label) => (
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
    </>
  );
}
