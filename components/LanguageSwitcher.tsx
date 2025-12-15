'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

interface Language {
  code: string;
  label: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

// Route mapping between languages
const routeMap: Record<string, Record<string, string>> = {
  lt: {
    '/products': '/produktai',
    '/solutions': '/sprendimai',
    '/projects': '/projektai',
    '/about': '/apie',
    '/contact': '/kontaktai',
  },
  en: {
    '/produktai': '/products',
    '/sprendimai': '/solutions',
    '/projektai': '/projects',
    '/apie': '/about',
    '/kontaktai': '/contact',
  },
};

export default function LanguageSwitcher() {
  const locale = useLocale();
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

    // Map current route to equivalent in new language
    let newPath = pathname;
    const routeMappings = routeMap[newLocale];

    if (routeMappings) {
      // Check if current path needs translation
      for (const [from, to] of Object.entries(routeMappings)) {
        if (pathname === from || pathname.startsWith(`${from}/`)) {
          newPath = pathname.replace(from, to);
          break;
        }
      }
    }

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
        className="
          flex items-center gap-2 px-3 py-2
          bg-white border border-[#E1E1E1] rounded-lg
          font-['DM_Sans'] text-[14px] text-[#161616] font-medium
          hover:border-[#161616] hover:bg-[#FAFAFA]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#161616] focus:ring-offset-2
        "
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Pasirinkti kalbą"
      >
        <span className="text-base" aria-hidden="true">
          {currentLanguage.flag}
        </span>
        <span className="uppercase">{currentLanguage.code}</span>
        <svg
          className={`w-4 h-4 text-[#535353] transition-transform duration-200 ${
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
          aria-label="Galimos kalbos"
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
                <span className="text-base" aria-hidden="true">
                  {language.flag}
                </span>
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
