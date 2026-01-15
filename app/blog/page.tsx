import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { applySeoOverride } from '@/lib/seo/overrides';
import { canonicalUrl } from '@/lib/seo/canonical';
import { getProjectOgImage } from '@/lib/og-image';
import BlogListClient from '@/components/blog/BlogListClient';
import { getBlogPosts } from '@/data/blog-posts';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.blog');
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const canonical = canonicalUrl('/blog', currentLocale);

  const posts = getBlogPosts(currentLocale).filter((post) => post.published);
  const ogImage = posts[0]?.heroImage ? getProjectOgImage(posts[0].heroImage) : undefined;

  const metadata: Metadata = {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical,
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('description'),
      url: canonical,
      type: 'website',
      siteName: 'Yakiwood',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: t('ogTitle') }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('ogTitle'),
      description: t('description'),
      images: ogImage ? [ogImage] : undefined,
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function BlogPage() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const initialPosts = getBlogPosts(currentLocale).filter((post) => post.published);

  return (
    <main className="bg-[#EAEAEA] min-h-screen">
      <BlogListClient initialPosts={initialPosts} />
    </main>
  );
}
