/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

const POSTS_STORAGE_KEY = 'yakiwood_posts';

function isDataUrl(src: string) {
  return src.startsWith('data:');
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
      for (const post of stored) merged.set(post.id, post);
      for (const post of initialPosts) {
        if (!merged.has(post.id)) merged.set(post.id, post);
      }

      setPosts(sortPosts(Array.from(merged.values())));
    } catch {
      // ignore parse errors
    }
  }, [initialPosts, locale]);

  const featured = posts[0];

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
        <div className="mt-[32px] lg:mt-[48px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={toLocalePath(`/blog/${post.slug}`, locale)}
              className="flex flex-col gap-[12px]"
            >
              <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden">
                <BlogImage src={post.heroImage} alt={post.title} />
              </div>
              <div className="font-['DM_Sans'] text-[18px] text-[#161616] leading-[1.2]">
                {post.title}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-[32px] font-['Outfit'] text-[14px] text-[#535353]">{t('empty')}</p>
      )}
    </div>
  );
}
