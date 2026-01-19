/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localizeBlogPost, normalizeStoredPosts, type LocalizedBlogPost } from '@/data/blog-posts';
import { toLocalePath, type AppLocale } from '@/i18n/paths';
import { assets } from '@/lib/assets';
import { Breadcrumbs } from '@/components/ui';
import { PageLayout } from '@/components/shared/PageLayout';

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
      <div className="relative h-[180px] rounded-[16px] overflow-hidden">
        <BlogImage src={post.heroImage} alt={post.title} />
      </div>
      <div className="font-['DM_Sans'] text-[16px] text-[#161616] leading-[1.2]">
        {post.title}
      </div>
      <div className="font-['Outfit'] text-[12px] text-[#535353]">
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

      <PageLayout>
        <div className="pt-[16px] pb-[120px]">

        <div className="mt-[18px] relative h-[240px] md:h-[420px] lg:h-[560px] overflow-hidden">
          <BlogImage src={post.heroImage} alt={post.title} />
        </div>

        <div className="mt-[26px] grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-[34px] lg:gap-[64px]">
          <div className="flex flex-col">
            <h1 className="font-['DM_Sans'] font-light text-[40px] md:text-[64px] leading-[1.02] tracking-[-1.6px] text-[#161616]">
              {post.title}
            </h1>

            <div className="mt-[14px]">
              <div className="font-['Outfit'] text-[12px] text-[#161616]">{post.author}</div>
              <div className="mt-[2px] font-['Outfit'] text-[12px] text-[#535353]">{formattedDate}</div>
            </div>

            {post.gallery.length > 0 && (
              <div className="mt-[22px] flex flex-col gap-[16px] max-w-[360px]">
                {post.gallery.slice(0, 2).map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative h-[160px] md:h-[200px] overflow-hidden"
                  >
                    <BlogImage src={src} alt={`${post.title} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="font-['Outfit'] text-[12px] md:text-[13px] leading-[1.75] text-[#535353]">
              {post.summary}
            </p>

            <div className="mt-[18px] space-y-[18px]">
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
          <div className="mt-[56px] md:mt-[72px]">
            <p className="font-['DM_Sans'] font-light text-[22px] md:text-[32px] leading-[1.25] tracking-[-0.6px] text-[#161616] text-center max-w-[900px] mx-auto">
              {post.callout}
            </p>
          </div>
        )}

        {post.excerpt && (
          <div className="mt-[44px] md:mt-[54px]">
            <p className="font-['DM_Sans'] font-light text-[18px] md:text-[22px] leading-[1.35] tracking-[-0.4px] text-[#161616] text-center max-w-[980px] mx-auto">
              {post.excerpt}
            </p>
          </div>
        )}

        {post.featureImages.length > 0 && (
          <div className="mt-[44px] grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {post.featureImages.slice(0, 2).map((src, index) => (
              <div key={`${src}-${index}`} className="relative h-[240px] md:h-[360px] overflow-hidden">
                <BlogImage src={src} alt={`${post.title} feature ${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {post.closing && (
          <p className="mt-[32px] font-['Outfit'] text-[14px] leading-[1.6] text-[#535353] max-w-[760px]">
            {post.closing}
          </p>
        )}

        {related.length > 0 && (
          <div className="mt-[72px]">
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="font-['DM_Sans'] font-light text-[32px] md:text-[48px] text-[#161616]">
                {t('related')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
              {related.map((item) => (
                <RelatedCard key={item.id} post={item} locale={locale} />
              ))}
            </div>
          </div>
        )}
        </div>
      </PageLayout>

      <section className="relative pb-[140px] md:pb-[200px]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[480px] md:w-[900px] opacity-15">
            <Image src={assets.ctaBackground} alt="" width={900} height={900} className="w-full h-auto" />
          </div>
        </div>
        <div className="relative max-w-[960px] mx-auto px-[16px] text-center">
          <h2 className="font-['DM_Sans'] font-light text-[48px] md:text-[96px] leading-[0.95] tracking-[-2px] text-[#161616]">
            {t('ctaTitle')}
            <span className="font-['Tiro_Tamil'] italic"> {t('ctaHighlight')}</span>?
          </h2>
          <p className="mt-[12px] font-['Outfit'] text-[14px] text-[#535353]">
            {t('ctaSubtitle')}
          </p>
          <div className="mt-[24px] flex flex-col md:flex-row items-center justify-center gap-[12px]">
            <Link
              href={toLocalePath('/contact', locale)}
              className="h-[46px] px-[30px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] uppercase tracking-[0.6px] flex items-center justify-center"
            >
              {t('ctaPrimary')}
            </Link>
            <Link
              href={toLocalePath('/products', locale)}
              className="h-[46px] px-[30px] rounded-[100px] border border-[#161616] text-[#161616] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] flex items-center justify-center hover:bg-[#161616] hover:text-white transition-colors"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
