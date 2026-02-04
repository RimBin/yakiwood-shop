/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import CTA from '@/components/home/CTA';
import { Breadcrumbs } from '@/components/ui';
import { PageLayout } from '@/components/shared/PageLayout';
import InView from '@/components/InView';

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

function RelatedCard({ post, locale }: { post: LocalizedBlogPost; locale: AppLocale }) {
  return (
    <Link
      href={toLocalePath(`/blog/${post.slug}`, locale)}
      className="flex flex-col gap-[10px]"
    >
      <div className="relative h-[180px] md:h-[200px] overflow-hidden">
        <BlogImage src={post.heroImage} alt={post.title} />
      </div>
      <div className="font-['DM_Sans'] text-[15px] md:text-[16px] text-[#161616] leading-[1.25]">
        {post.title}
      </div>
      <div className="font-['Outfit'] text-[12px] leading-[1.6] text-[#535353]">
        {post.excerpt}
      </div>
    </Link>
  );
}

export default function BlogPostClient({
  initialPost,
  initialRelated,
}: {
  initialPost: LocalizedBlogPost;
  initialRelated: LocalizedBlogPost[];
}) {
  const t = useTranslations('blog');
  const tCommon = useTranslations('common');
  const tBreadcrumbs = useTranslations('breadcrumbs');
  const locale = useLocale() as AppLocale;
  const [post, setPost] = useState<LocalizedBlogPost>(initialPost);
  const [related, setRelated] = useState<LocalizedBlogPost[]>(initialRelated);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeStoredPosts(parsed);
      if (!normalized) return;

      const localized = normalized
        .map((stored) => localizeBlogPost(stored, locale === 'lt' ? 'lt' : 'en'))
        .filter((item) => item.published);

      const merged = new Map<string, LocalizedBlogPost>();
      for (const item of localized) merged.set(item.id, item);
      for (const item of [initialPost, ...initialRelated]) {
        if (!merged.has(item.id)) merged.set(item.id, item);
      }

      const all = sortPosts(Array.from(merged.values()));
      const current =
        all.find((item) => item.id === initialPost.id || item.slug === initialPost.slug) || initialPost;

      const nextRelated = all.filter((item) => item.id !== current.id).slice(0, 3);

      setPost(current);
      if (nextRelated.length > 0) setRelated(nextRelated);
    } catch {
      // ignore parse errors
    }
  }, [initialPost, initialRelated, locale]);

  const formattedDate = useMemo(() => formatDate(post.date, locale), [post.date, locale]);

  return (
    <main className="bg-[#E1E1E1]">
      <Breadcrumbs
        items={[
          { label: tBreadcrumbs('home'), href: toLocalePath('/', locale) },
          { label: t('title'), href: toLocalePath('/blog', locale) },
          { label: post.title },
        ]}
      />

      <InView className="hero-animate-root">
        <PageLayout>
          <div className="pt-[12px] pb-[120px]">

        <div className="mt-[18px] relative h-[240px] md:h-[420px] lg:h-[560px] overflow-hidden hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
          <BlogImage src={post.heroImage} alt={post.title} />
        </div>

        <div className="mt-[26px] grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-[34px] lg:gap-[64px]">
          <div className="flex flex-col hero-seq-item hero-seq-right" style={{ animationDelay: '180ms' }}>
            <h1 className="font-['DM_Sans'] font-light text-[32px] sm:text-[40px] md:text-[52px] lg:text-[64px] leading-[1.02] tracking-[-1.6px] text-[#161616]">
              {post.title}
            </h1>

            <div className="mt-[14px]">
              <div className="font-['Outfit'] text-[12px] text-[#161616]">{post.author}</div>
              <div className="mt-[2px] font-['Outfit'] text-[12px] text-[#535353]">{formattedDate}</div>
            </div>

            {post.gallery.length > 0 && (
              <div className="mt-[22px] grid grid-cols-2 gap-[12px] max-w-[360px]">
                {post.gallery.slice(0, 2).map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative h-[120px] sm:h-[130px] md:h-[150px] overflow-hidden"
                  >
                    <BlogImage src={src} alt={`${post.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
            <p className="font-['Outfit'] text-[12px] md:text-[13px] leading-[1.75] text-[#535353]">
              {post.summary}
            </p>

            <div className="mt-[18px] space-y-[20px]">
              {post.sections.map((section) => (
                <div key={section.heading}>
                  <div className="font-['Outfit'] font-semibold text-[12px] md:text-[13px] leading-[1.35] text-[#161616]">
                    {section.heading}
                  </div>
                  <p className="mt-[6px] font-['Outfit'] text-[12px] md:text-[13px] leading-[1.75] text-[#535353]">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>

            {post.body.length > 0 && (
              <div className="mt-[18px] space-y-[14px]">
                {post.body.map((paragraph, idx) => (
                  <p key={`${post.id}-p-top-${idx}`} className="font-['Outfit'] text-[12px] md:text-[13px] leading-[1.75] text-[#535353]">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {post.callout && (
          <div className="mt-[56px] md:mt-[72px] hero-seq-item hero-seq-right" style={{ animationDelay: '520ms' }}>
            <p className="font-['DM_Sans'] font-light text-[22px] md:text-[32px] leading-[1.25] tracking-[-0.6px] text-[#161616] text-center max-w-[900px] mx-auto">
              {post.callout}
            </p>
          </div>
        )}

        {post.excerpt && (
          <div className="mt-[44px] md:mt-[54px] hero-seq-item hero-seq-right" style={{ animationDelay: '640ms' }}>
            <p className="font-['DM_Sans'] font-light text-[18px] md:text-[22px] leading-[1.35] tracking-[-0.4px] text-[#161616] text-center max-w-[980px] mx-auto">
              {post.excerpt}
            </p>
          </div>
        )}

        {post.featureImages.length > 0 && (
          <div className="mt-[44px] hero-seq-item hero-seq-right" style={{ animationDelay: '760ms' }}>
            {post.featureImages.length === 1 ? (
              <div className="relative h-[260px] md:h-[380px] lg:h-[460px] overflow-hidden">
                <BlogImage src={post.featureImages[0]} alt={`${post.title} feature 1`} />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-[16px]">
                <div className="relative h-[260px] md:h-[380px] lg:h-[460px] overflow-hidden">
                  <BlogImage src={post.featureImages[0]} alt={`${post.title} feature 1`} />
                </div>
                <div className="grid grid-cols-1 gap-[16px]">
                  {post.featureImages.slice(1, 3).map((src, index) => (
                    <div
                      key={`${src}-${index}`}
                      className="relative h-[200px] md:h-[240px] lg:h-[220px] overflow-hidden"
                    >
                      <BlogImage src={src} alt={`${post.title} feature ${index + 2}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {post.closing && (
          <p className="mt-[32px] font-['Outfit'] text-[14px] leading-[1.6] text-[#535353] max-w-[760px] hero-seq-item hero-seq-right" style={{ animationDelay: '900ms' }}>
            {post.closing}
          </p>
        )}

        {related.length > 0 && (
          <div className="mt-[72px] hero-seq-item hero-seq-right" style={{ animationDelay: '1040ms' }}>
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="font-['DM_Sans'] font-light text-[32px] md:text-[48px] text-[#161616]">
                {t('related')}
              </h2>
              <Link
                href={toLocalePath('/blog', locale)}
                className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]"
              >
                {tCommon('viewAll')}
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
              {related.map((item, index) => (
                <div key={item.id} className="hero-seq-item hero-seq-right" style={{ animationDelay: `${1180 + index * 140}ms` }}>
                  <RelatedCard post={item} locale={locale} />
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </PageLayout>
      </InView>

      <CTA />
    </main>
  );
}
