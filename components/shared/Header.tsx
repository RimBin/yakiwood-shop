'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAsset } from '@/lib/assets';
import MobileMenu from './MobileMenu';
import CartSidebar from './CartSidebar';
import { useCartStore } from '@/lib/cart/store';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const navItems = [
    { href: '/products', label: 'Products' },
    { href: '/solutions', label: 'Solutions' },
    { href: '/projects', label: 'Projects' },
    { href: '/about', label: 'About us' },
    { href: '/contact', label: 'Contact' },
  ];
  
  return (
    <header className="w-full sticky top-0 z-50">
      {/* Black Announcement Bar */}
      <div className="bg-[#161616] w-full py-[12px] px-[16px] sm:px-[24px] lg:px-[40px]">
        <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-center gap-[16px] sm:gap-[32px] text-white">
          {/* Fast Delivery */}
          <div className="flex items-center gap-[8px]">
            <div className="relative w-[20px] h-[20px] shrink-0">
              <Image src="/assets/icons/fast-delivery.svg" alt="" width={20} height={20} />
            </div>
            <span className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-white whitespace-nowrap">FAST DELIVERY</span>
          </div>

          {/* Money Back Guarantee */}
          <div className="flex items-center gap-[8px] text-center md:text-left">
            <div className="relative w-[20px] h-[20px] shrink-0">
              <Image src="/assets/icons/money-back.svg" alt="" width={20} height={20} />
            </div>
            <span className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-white whitespace-nowrap">MONEY BACK GUARANTEE</span>
          </div>

          {/* Eco-Friendly */}
          <div className="hidden lg:flex items-center gap-[8px]">
            <div className="relative w-[20px] h-[20px] shrink-0">
              <Image src="/assets/icons/eco-friendly.svg" alt="" width={20} height={20} />
            </div>
            <span className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-white whitespace-nowrap">ECO-FRIENDLY</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#E1E1E1] border-b border-[#bbbbbb] border-solid">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px]">
          <div className="flex items-center gap-[16px]">
            {/* Logo - exact 126x48px */}
            <Link href="/" aria-label="Yakiwood homepage" className="h-[48px] w-[126px] relative shrink-0">
              <Image src={getAsset('imgLogo')} alt="Yakiwood Logo" fill style={{ objectFit: 'contain' }} />
            </Link>

            {/* Navigation - hidden on mobile/tablet, shown on large screens */}
            <nav className="hidden lg:flex flex-1 justify-center gap-[32px] xl:gap-[40px]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-center tracking-[0.6px] uppercase text-[#161616] hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Cart button + language toggle */}
            <div className="ml-auto flex items-center gap-[12px]">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="border border-[#BBBBBB] border-solid rounded-[100px] flex gap-[8px] h-[48px] items-center justify-center px-[24px] py-[10px] bg-transparent hover:bg-[#161616] hover:text-white transition-colors group relative"
              >
                <div className="relative w-[24px] h-[24px] overflow-clip shrink-0">
                  <Image src={getAsset('imgCart')} alt="Cart" fill style={{ objectFit: 'contain' }} />
                </div>
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] group-hover:text-white shrink-0">
                  Cart {items.length > 0 && `(${items.length})`}
                </span>
              </button>

              {/* Mobile Menu Button - visible only on mobile/tablet */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden border border-[#BBBBBB] border-solid rounded-[100px] w-[48px] h-[48px] flex items-center justify-center bg-transparent hover:bg-[#161616] transition-colors group"
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:stroke-white transition-colors">
                  <path d="M3 12H21M3 6H21M3 18H21" stroke="#161616" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
