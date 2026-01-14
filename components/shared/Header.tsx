'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { getAsset } from '@/lib/assets';
import MobileMenu from './MobileMenu';
import CartSidebar from './CartSidebar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useCartStore } from '@/lib/cart/store';
import { toLocalePath } from '@/i18n/paths';

export default function Header() {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const items = useCartStore((state) => state.items);
  
  const isHomepage = pathname === '/' || pathname === '/lt';

  useEffect(() => {
    if (!isHomepage) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomepage]);
  
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const navItems = [
    {
      href: toLocalePath('/products', currentLocale),
      label: t(locale === 'lt' ? 'nav.produktai' : 'nav.products'),
    },
    {
      href: toLocalePath('/solutions', currentLocale),
      label: t(locale === 'lt' ? 'nav.sprendimai' : 'nav.solutions'),
    },
    {
      href: toLocalePath('/projects', currentLocale),
      label: t(locale === 'lt' ? 'nav.projektai' : 'nav.projects'),
    },
    {
      href: toLocalePath('/blog', currentLocale),
      label: t(locale === 'lt' ? 'nav.straipsniai' : 'nav.blog'),
    },
    {
      href: toLocalePath('/configurator3d', currentLocale),
      label: t(locale === 'lt' ? 'nav.konfiguratorius3d' : 'nav.configurator3d'),
    },
    {
      href: toLocalePath('/about', currentLocale),
      label: t(locale === 'lt' ? 'nav.apie' : 'nav.about'),
    },
    {
      href: toLocalePath('/contact', currentLocale),
      label: t(locale === 'lt' ? 'nav.kontaktai' : 'nav.contact'),
    },
  ];
  
  return (
    <header className="w-full fixed top-0 z-50">
      {/* Black Announcement Bar */}
      <div className="bg-[#161616] w-full py-[8px] px-[40px]">
        <div className="flex items-center justify-center gap-[32px] xl:gap-[200px]">
          {/* Fast Delivery */}
          <div className="flex items-center gap-[8px]">
            <div className="relative w-[24px] h-[24px] shrink-0">
              <Image src={getAsset('imgIconTruck')} alt={t('header.fastDelivery')} width={24} height={24} />
            </div>
            <p className="font-['Outfit'] text-[12px] font-normal leading-[1.2] uppercase tracking-[0.6px] text-white whitespace-nowrap">
              {t('header.fastDelivery')}
            </p>
          </div>

          {/* Money Back Guarantee */}
          <div className="flex items-center gap-[8px]">
            <div className="relative w-[24px] h-[24px] shrink-0">
              <Image src={getAsset('imgIconCoins')} alt={t('header.moneyBack')} width={24} height={24} />
            </div>
            <p className="font-['Outfit'] text-[12px] font-normal leading-[1.2] uppercase tracking-[0.6px] text-white whitespace-nowrap">
              {t('header.moneyBack')}
            </p>
          </div>

          {/* Eco-Friendly */}
          <div className="hidden lg:flex items-center gap-[8px]">
            <div className="relative w-[24px] h-[24px] shrink-0">
              <Image src={getAsset('imgIconPlant')} alt={t('header.ecoFriendly')} width={24} height={24} />
            </div>
            <p className="font-['Outfit'] text-[12px] font-normal leading-[1.2] uppercase tracking-[0.6px] text-white whitespace-nowrap">
              {t('header.ecoFriendly')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`transition-all duration-300 border-b border-solid ${
        isHomepage && !isScrolled
          ? 'bg-transparent border-transparent'
          : 'bg-[#E1E1E1]/80 backdrop-blur-md border-[#bbbbbb]/30 shadow-sm'
      }`}>
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px]">
          <div className="flex items-center gap-[16px]">
            {/* Logo - exact 126x48px */}
            <Link
              href={toLocalePath('/', currentLocale)}
              aria-label="Yakiwood homepage"
              className="h-[48px] w-[126px] relative shrink-0"
            >
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

            {/* Cart button + language toggle + mobile menu */}
            <div className="ml-auto flex items-center gap-[8px] md:gap-[12px]">
              {/* Language Switcher - hidden on mobile, shown on desktop */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
              
              <button 
                onClick={() => setIsCartOpen(true)}
                className="border border-[#BBBBBB] border-solid rounded-[100px] flex gap-[8px] h-[40px] md:h-[48px] items-center justify-center px-[16px] md:px-[24px] py-[10px] bg-transparent hover:bg-[#161616] hover:text-white transition-colors group relative"
              >
                <div className="relative w-[24px] h-[24px] overflow-clip shrink-0 icon-wrapper">
                  <Image src={getAsset('imgCart')} alt="Cart" fill className="icon-image" style={{ objectFit: 'contain' }} />
                </div>
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] group-hover:text-white shrink-0">
                  {t(locale === 'lt' ? 'header.krepselis' : 'header.cart')} {items.length > 0 && `(${items.length})`}
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
