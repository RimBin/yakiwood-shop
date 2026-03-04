'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { projects as projectsData } from '@/data/projects';
import { blogPosts, type BlogPost } from '@/data/blog-posts';
import type { Project } from '@/types/project';
import { findProjectBySlug, getProjectSlug, normalizeProjectLocale } from '@/lib/projects/i18n';
import { toLocalePath } from '@/i18n/paths';

interface Language {
  code: string;
  label: string;
}

type LanguageSwitcherVariant = 'light' | 'dark';

const languages: Language[] = [
  { code: 'lt', label: 'Lietuvių' },
  { code: 'en', label: 'English' },
];

async function fetchProjects(locale: 'lt' | 'en'): Promise<Project[]> {
  try {
    const res = await fetch(`/api/projects?locale=${encodeURIComponent(locale)}`);
    const json = (await res.json().catch(() => null)) as any;
    return Array.isArray(json?.projects) ? (json.projects as Project[]) : projectsData;
  } catch {
    return projectsData;
  }
}

async function fetchPosts(locale: 'lt' | 'en'): Promise<BlogPost[]> {
  try {
    const res = await fetch(`/api/posts?locale=${encodeURIComponent(locale)}`);
    const json = (await res.json().catch(() => null)) as any;
    return Array.isArray(json?.posts) ? (json.posts as BlogPost[]) : blogPosts;
  } catch {
    return blogPosts;
  }
}

function stripQueryAndHash(pathname: string): string {
  return pathname.split('?')[0].split('#')[0];
}

function extractProjectSlugFromPath(pathname: string): string | null {
  const p = stripQueryAndHash(pathname);

  const ltPrefix = '/lt/projektai/';
  if (p.startsWith(ltPrefix)) return p.slice(ltPrefix.length).split('/')[0] || null;

  const ltLegacy = '/projektai/';
  if (p.startsWith(ltLegacy)) return p.slice(ltLegacy.length).split('/')[0] || null;

  const enPrefix = '/projects/';
  if (p.startsWith(enPrefix)) return p.slice(enPrefix.length).split('/')[0] || null;

  return null;
}

function extractBlogSlugFromPath(pathname: string): string | null {
  const p = stripQueryAndHash(pathname);

  const ltPrefix = '/lt/straipsniai/';
  if (p.startsWith(ltPrefix)) return p.slice(ltPrefix.length).split('/')[0] || null;

  const ltLegacy = '/straipsniai/';
  if (p.startsWith(ltLegacy)) return p.slice(ltLegacy.length).split('/')[0] || null;

  const enPrefix = '/blog/';
  if (p.startsWith(enPrefix)) return p.slice(enPrefix.length).split('/')[0] || null;

  return null;
}

export default function LanguageSwitcher({
  variant = 'light',
}: {
  variant?: LanguageSwitcherVariant;
}) {
  const locale = useLocale();
  const t = useTranslations('languageSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';

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

  const handleLanguageChange = async (newLocale: string) => {
    // Store preference in cookie (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    const fromLocale = normalizeProjectLocale(locale);
    const targetLocale = normalizeProjectLocale(newLocale);

    // Default: just map route prefixes
    let newPath = toLocalePath(pathname || '/', targetLocale);

    // Special-case: project detail routes need slug translation too
    const currentProjectSlug = extractProjectSlugFromPath(pathname);
    if (currentProjectSlug) {
      const projects = await fetchProjects(fromLocale);
      const project = findProjectBySlug(projects, currentProjectSlug, fromLocale);
      if (project) {
        const translatedSlug = getProjectSlug(project, targetLocale);
        const targetBase = targetLocale === 'lt' ? '/lt/projektai' : '/projects';
        newPath = `${targetBase}/${translatedSlug}`;
      }
    }

    // Special-case: blog/straipsniai detail routes need slug translation too
    const currentBlogSlug = extractBlogSlugFromPath(pathname);
    if (currentBlogSlug) {
      const posts = await fetchPosts(fromLocale);
      const match = posts.find((post) => post.slug[fromLocale] === currentBlogSlug);
      if (match) {
        const targetBase = targetLocale === 'lt' ? '/lt/straipsniai' : '/blog';
        newPath = `${targetBase}/${match.slug[targetLocale]}`;
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
        className={`group border border-solid rounded-[100px] flex gap-[8px] h-[40px] md:h-[48px] items-center justify-center px-[16px] md:px-[20px] py-[10px] bg-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isDark
            ? 'border-white/20 hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-[#161616]'
            : 'border-[#535353] hover:bg-[#161616] hover:border-white focus-visible:ring-[#161616]'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('toggleAria')}
      >
        <span
          className={`font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase shrink-0 ${
            isDark ? 'text-white' : 'text-[#161616] group-hover:text-white'
          }`}
        >
          {currentLanguage.code}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isDark ? 'text-white' : 'text-[#161616] group-hover:text-white'
          } ${isOpen ? 'rotate-180' : ''}`}
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
          className={`
            absolute mt-2 w-40
            rounded-lg shadow-lg overflow-hidden
            z-50
            animate-in fade-in slide-in-from-top-2 duration-200
            ${
              isDark
                ? 'left-0 bg-[#161616] border border-white/20'
                : 'right-0 bg-white border border-[#E1E1E1]'
            }
          `}
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
                    isDark
                      ? isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                      : isActive
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
