import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { applySeoOverride } from '@/lib/seo/overrides';
import { canonicalUrl } from '@/lib/seo/canonical';
import { getProjectOgImage } from '@/lib/og-image';
import { blogPosts, getBlogPostBySlug } from '@/data/blog-posts';

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

  if (locale !== 'lt') {
    const match = blogPosts.find((post) => post.slug.lt === slug);
    if (match) {
      redirect(`/blog/${match.slug.en}`);
    }
    redirect('/blog');
  }

  redirect(`/lt/straipsniai/${slug}`);

  return null;
}
