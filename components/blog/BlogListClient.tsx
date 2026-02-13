/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { PageCover } from '@/components/shared';
import { PageLayout } from '@/components/shared/PageLayout';
import InView from '@/components/InView';

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
  const tCommon = useTranslations('common');
  const locale = useLocale() as AppLocale;
  const [posts, setPosts] = useState<LocalizedBlogPost[]>(() => sortPosts(initialPosts));
  const [visibleCount, setVisibleCount] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const itemsPerPage = 8;
  const visiblePosts = posts.slice(0, Math.min(visibleCount, posts.length));
  const hasMore = visiblePosts.length < posts.length;

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
    setVisibleCount((prev) => Math.min(Math.max(itemsPerPage, prev), posts.length || itemsPerPage));
  }, [posts.length, itemsPerPage]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const sentinel = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || isLoading) return;
        setIsLoading(true);
        window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + itemsPerPage, posts.length));
          setIsLoading(false);
        }, 220);
      },
      { rootMargin: '200px 0px 200px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, itemsPerPage, posts.length]);

  return (
    <>
      <InView className="hero-animate-root">
        <PageCover innerClassName="px-0">
          <div className="flex items-start gap-[8px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <h1
              className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              {t('title')}
            </h1>
            <p
              className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-0.72px] md:tracking-[-1.28px]"
              style={{ fontVariationSettings: "'opsz' 14" }}
            >
              ({posts.length})
            </p>
          </div>
        </PageCover>
      </InView>

      <InView className="hero-animate-root">
        <PageLayout>
          <div className="pt-[24px] pb-[120px]">
          {posts.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-[repeat(4,328px)] 2xl:justify-between gap-x-[16px] gap-y-[16px]">
                {visiblePosts.map((post, index) => {
                  const tall = index % 2 === 1;
                  const imageHeight = tall ? 'h-[320px] md:h-[448px]' : 'h-[220px] md:h-[305px]';
                  const delay = 180 + ((index % 4) * 120) + (Math.floor(index / 4) * 80);

                  return (
                    <article
                      key={post.id}
                      className="overflow-hidden 2xl:w-[328px] hero-seq-item hero-seq-right"
                      style={{ animationDelay: `${delay}ms` }}
                    >
                      <Link href={toLocalePath(`/blog/${post.slug}`, locale)} className="block">
                        <div className={`relative w-full ${imageHeight} overflow-hidden bg-[#D9D9D9]`}>
                          <BlogImage src={post.heroImage} alt={post.title} />
                        </div>
                        <div className="pr-[12px] py-[10px]">
                          <div className="font-['DM_Sans'] text-[18px] leading-[1.25] text-[#161616]">
                            {post.title}
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              <div className="mt-[30px] flex items-center justify-center hero-seq-item hero-seq-right" style={{ animationDelay: '520ms' }}>
                {hasMore ? (
                  <div className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">
                    {isLoading ? tCommon('kraunasi') : tCommon('rodytiDaugiau')}
                  </div>
                ) : null}
                <div ref={sentinelRef} className="h-[1px] w-full" />
              </div>
            </>
          ) : (
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('empty')}</p>
          )}
          </div>
        </PageLayout>
      </InView>
    </>
  );
}
