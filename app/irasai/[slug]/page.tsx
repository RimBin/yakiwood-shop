import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { applySeoOverride } from '@/lib/seo/overrides';
import { canonicalUrl } from '@/lib/seo/canonical';
import { generateArticleSchema } from '@/lib/schema';
import { getProjectOgImage } from '@/lib/og-image';
import BlogPostClient from '@/components/blog/BlogPostClient';
import { blogPosts, getBlogPostBySlug, getRelatedBlogPosts } from '@/data/blog-posts';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug.lt }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const post = getBlogPostBySlug(slug, currentLocale);

  if (!post) {
    return { title: 'Blog' };
  }

  const canonical = canonicalUrl(`/blog/${post.slug}`, currentLocale);
  const ogImage = getProjectOgImage(post.heroImage);

  const metadata: Metadata = {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonical,
      type: 'article',
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
  };

  return applySeoOverride(metadata, new URL(canonical).pathname, currentLocale);
}

export default async function BlogPostPageLt({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const post = getBlogPostBySlug(slug, currentLocale);

  if (!post) {
    notFound();
  }

  const related = getRelatedBlogPosts(post.slug, currentLocale, 3);
  const schema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    image: getProjectOgImage(post.heroImage),
    datePublished: post.date,
    author: post.author,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BlogPostClient initialPost={post} initialRelated={related} />
    </>
  );
}
