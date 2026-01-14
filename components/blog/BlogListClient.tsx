/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

const POSTS_STORAGE_KEY = 'yakiwood_posts';

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

function formatDate(date: string, locale: AppLocale) {
  const value = new Date(date);
  const localeKey = locale === 'lt' ? 'lt-LT' : 'en-GB';
  return new Intl.DateTimeFormat(localeKey, { year: 'numeric', month: 'long', day: 'numeric' }).format(value);
}

function sortPosts(posts: LocalizedBlogPost[]) {
  return posts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function BlogImage({ src, alt }: { src: string; alt: string }) {
  if (!src) return null;
  if (isDataUrl(src)) {
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }
  return <Image src={src} alt={alt} fill className="object-cover" />;
}

export default function BlogListClient({ initialPosts }: { initialPosts: LocalizedBlogPost[] }) {
  const t = useTranslations('blog');
  const locale = useLocale() as AppLocale;
  const [posts, setPosts] = useState<LocalizedBlogPost[]>(() => sortPosts(initialPosts));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeStoredPosts(parsed);
      if (!normalized) return;

      const stored = normalized
        .map((post) => localizeBlogPost(post, locale === 'lt' ? 'lt' : 'en'))
        .filter((post) => post.published);

      const merged = new Map<string, LocalizedBlogPost>();
      for (const post of initialPosts) merged.set(post.id, post);
      for (const post of stored) merged.set(post.id, post);

      setPosts(sortPosts(Array.from(merged.values())));
    } catch {
      // ignore parse errors
    }
  }, [initialPosts, locale]);

  const featured = posts[0];
  const rest = useMemo(() => posts.slice(1), [posts]);

  return (
    <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[120px]">
      <div className="pt-[40px] md:pt-[64px]">
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[120px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]">
          {t('title')}
        </h1>
        <p className="mt-[12px] max-w-[520px] font-['Outfit'] text-[14px] md:text-[16px] leading-[1.4] text-[#535353]">
          {t('subtitle')}
        </p>
      </div>

      {featured ? (
        <div className="mt-[32px] lg:mt-[48px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-[24px] items-stretch">
          <Link
            href={toLocalePath(`/blog/${featured.slug}`, locale)}
            className="relative h-[320px] md:h-[420px] lg:h-[520px] rounded-[24px] overflow-hidden"
          >
            <BlogImage src={featured.heroImage} alt={featured.title} />
          </Link>
          <div className="flex flex-col justify-between gap-[16px]">
            <div>
              <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
                {featured.category}
              </div>
              <h2 className="mt-[12px] font-['DM_Sans'] text-[32px] md:text-[40px] leading-[1.05] text-[#161616]">
                {featured.title}
              </h2>
              <p className="mt-[12px] font-['Outfit'] text-[14px] leading-[1.5] text-[#535353]">
                {featured.excerpt}
              </p>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#888] font-['Outfit']">
              <span>{formatDate(featured.date, locale)}</span>
              <span>{t('readTime', { minutes: featured.readTimeMinutes })}</span>
            </div>
            <Link
              href={toLocalePath(`/blog/${featured.slug}`, locale)}
              className="inline-flex items-center gap-[8px] h-[40px] px-[18px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#161616] hover:text-white transition-colors w-fit"
            >
              {t('readMore')}
            </Link>
          </div>
        </div>
      ) : (
        <p className="mt-[32px] font-['Outfit'] text-[14px] text-[#535353]">{t('empty')}</p>
      )}

      {rest.length > 0 && (
        <div className="mt-[48px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={toLocalePath(`/blog/${post.slug}`, locale)}
              className="flex flex-col gap-[12px]"
            >
              <div className="relative h-[220px] rounded-[20px] overflow-hidden">
                <BlogImage src={post.heroImage} alt={post.title} />
              </div>
              <div className="font-['Outfit'] text-[11px] uppercase tracking-[0.6px] text-[#535353]">
                {post.category}
              </div>
              <div className="font-['DM_Sans'] text-[20px] text-[#161616] leading-[1.2]">
                {post.title}
              </div>
              <p className="font-['Outfit'] text-[13px] text-[#535353] leading-[1.5]">
                {post.excerpt}
              </p>
              <div className="flex items-center justify-between text-[11px] text-[#888] font-['Outfit']">
                <span>{formatDate(post.date, locale)}</span>
                <span>{t('readTime', { minutes: post.readTimeMinutes })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
