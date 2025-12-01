'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
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
              href="/paskyra"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Paskyra
            </Link>
            <Link
              href="/produktai"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Produktai
            </Link>
            <Link
              href="/sprendimai"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Sprendimai
            </Link>
            <Link
              href="/projektai"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Projektai
            </Link>
            <Link
              href="/apie"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Apie mus
            </Link>
            <Link
              href="/kontaktai"
              className="font-['DM_Sans'] font-light text-[32px] leading-[1.2] tracking-[-1.28px] text-white hover:opacity-70 transition-opacity"
              onClick={onClose}
            >
              Kontaktai
            </Link>
          </nav>

          {/* Bottom Section */}
          <div className="flex flex-col gap-[32px] pt-[32px] border-t border-white/20">
            {/* CTA Button - Figma: border only, not filled */}
            <button className="w-[357px] mx-auto border border-[#535353] rounded-[100px] h-[48px] flex items-center justify-center hover:bg-white/10 transition-colors">
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                Susisiekti
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
              <div className="relative w-[36px] h-[22px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/e9fea262-02f4-4e24-accc-8ef97f1186e8"
                  alt="Mastercard"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="relative w-[36px] h-[12px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/b4125504-97a0-4e03-b129-fe739a9bff9e"
                  alt="Visa"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="relative w-[40px] h-[25px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/4c013541-0c2e-4f54-9c5f-f33906b58555"
                  alt="Maestro"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="relative w-[53px] h-[25px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/c45a5013-275c-421d-add8-03996664eb8b"
                  alt="Stripe"
                  fill
                  className="object-contain grayscale"
                />
              </div>
              <div className="relative w-[57px] h-[14px]">
                <Image
                  src="https://www.figma.com/api/mcp/asset/6d2dccad-ca60-480f-9e95-6a91a61ab095"
                  alt="PayPal"
                  fill
                  className="object-contain grayscale"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
