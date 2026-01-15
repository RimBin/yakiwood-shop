/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { getPaginationRange } from '@/lib/pagination';

const POSTS_STORAGE_KEY = 'yakiwood_posts';

function isDataUrl(src: string) {
  return src.startsWith('data:');
}

function sortPosts(posts: LocalizedBlogPost[]) {
  return posts.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getMasonryAspect(index: number): string {
  // Pattern tuned to create a masonry feel similar to the design mock.
  // Using different aspect ratios gives a more editorial grid.
  const pattern = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-[1/1]', 'aspect-[16/9]', 'aspect-[4/5]', 'aspect-[2/3]'] as const;
  // Keep mobile simple (consistent aspect), enable variation from tablet+.
  const tabletUp = pattern[index % pattern.length];
  return `aspect-[4/3] md:${tabletUp}`;
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
  const [page, setPage] = useState(1);

  const itemsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(posts.length / itemsPerPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;
  const visiblePosts = posts.slice(startIndex, startIndex + itemsPerPage);
  const { pages } = getPaginationRange(safePage, totalPages, 5);

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

  useEffect(() => {
    // Keep page valid when posts set changes.
    setPage((prev) => Math.max(1, Math.min(prev, Math.max(1, Math.ceil(posts.length / itemsPerPage)))));
  }, [posts.length]);

  return (
    <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px] pb-[120px]">
      <div className="pt-[28px] md:pt-[44px]">
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[72px] leading-[0.95] tracking-[-2.8px] md:tracking-[-3.2px] text-[#161616]">
          {t('title')}
        </h1>
        <div className="mt-[20px] h-px w-full bg-[#161616]/30" />
      </div>

      {posts.length ? (
        <>
          <div className="mt-[24px] md:mt-[32px] columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-x-[20px]">
            {visiblePosts.map((post, index) => (
              <article key={post.id} className="mb-[20px] break-inside-avoid">
                <Link
                  href={toLocalePath(`/blog/${post.slug}`, locale)}
                  className="block"
                >
                  <div className={`relative w-full ${getMasonryAspect(startIndex + index)} overflow-hidden bg-[#D9D9D9]`}>
                    <BlogImage src={post.heroImage} alt={post.title} />
                  </div>
                  <div className="bg-white px-[10px] py-[10px]">
                    <div className="font-['DM_Sans'] text-[12px] leading-[1.35] text-[#161616]">
                      {post.title}
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav aria-label="Blog pagination" className="mt-[34px] flex items-center justify-center gap-[10px]">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                aria-label="Previous page"
                className="h-[32px] w-[32px] inline-flex items-center justify-center text-[#161616] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              {pages.map((p, idx) => {
                if (p === 'ellipsis') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="h-[32px] min-w-[32px] inline-flex items-center justify-center text-[12px] font-['DM_Sans'] text-[#161616]/70 select-none"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  );
                }

                const active = p === safePage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    aria-current={active ? 'page' : undefined}
                    className={`h-[32px] min-w-[32px] px-[10px] inline-flex items-center justify-center rounded-full text-[12px] font-['DM_Sans'] transition-colors ${
                      active
                        ? 'bg-[#161616] text-white'
                        : 'text-[#161616] hover:bg-[#161616]/10'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                aria-label="Next page"
                className="h-[32px] w-[32px] inline-flex items-center justify-center text-[#161616] disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      ) : (
        <p className="mt-[32px] font-['Outfit'] text-[14px] text-[#535353]">{t('empty')}</p>
      )}
    </div>
  );
}
