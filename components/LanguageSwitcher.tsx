'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface Language {
  code: string;
  label: string;
}

const languages: Language[] = [
  { code: 'lt', label: 'Lietuvių' },
  { code: 'en', label: 'English' },
];

type PrefixMap = Array<{ from: string; to: string }>;

const enToLt: PrefixMap = [
  { from: '/products', to: '/produktai' },
  { from: '/solutions', to: '/sprendimai' },
  { from: '/projects', to: '/projektai' },
  { from: '/blog', to: '/irasai' },
  { from: '/about', to: '/apie' },
  { from: '/contact', to: '/kontaktai' },
  { from: '/faq', to: '/duk' },
  { from: '/configurator3d', to: '/konfiguratorius3d' },
];

const ltToEn: PrefixMap = enToLt.map(({ from, to }) => ({ from: to, to: from }));

function replaceLeadingPath(pathname: string, mapping: PrefixMap): string {
  for (const { from, to } of mapping) {
    if (pathname === from || pathname.startsWith(`${from}/`)) {
      return pathname.replace(from, to);
    }
  }
  return pathname;
}

function toLtPath(pathname: string): string {
  if (pathname === '/lt' || pathname.startsWith('/lt/')) return pathname;
  if (pathname === '/') return '/lt';

  const mapped = replaceLeadingPath(pathname, enToLt);
  return `/lt${mapped}`;
}

function toEnPath(pathname: string): string {
  if (pathname === '/') return '/';
  if (pathname === '/lt') return '/';
  if (!pathname.startsWith('/lt/')) return pathname;

  const withoutPrefix = pathname.slice(3);
  return replaceLeadingPath(withoutPrefix, ltToEn);
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    // Store preference in cookie (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    const newPath = newLocale === 'lt' ? toLtPath(pathname) : toEnPath(pathname);

    setIsOpen(false);
    router.push(newPath);
    router.refresh();
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group border border-[#BBBBBB] border-solid rounded-[100px] flex gap-[8px] h-[40px] md:h-[48px] items-center justify-center px-[16px] md:px-[20px] py-[10px] bg-transparent hover:bg-[#161616] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#161616] focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('toggleAria')}
      >
        <span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616] group-hover:text-white shrink-0">
          {currentLanguage.code}
        </span>
        <svg
          className={`w-4 h-4 text-[#161616] group-hover:text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 w-40
            bg-white border border-[#E1E1E1] rounded-lg
            shadow-lg overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
          "
          role="listbox"
          aria-label={t('optionsAria')}
        >
          {languages.map((language) => {
            const isActive = language.code === locale;
            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  font-['DM_Sans'] text-[14px] text-left
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#161616] text-white'
                      : 'text-[#161616] hover:bg-[#F5F5F5]'
                  }
                `}
                role="option"
                aria-selected={isActive}
              >
                <span className="flex-1">{language.label}</span>
                {isActive && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
