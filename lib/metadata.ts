/**
 * Metadata utilities for automatic SEO setup
 * Use createMetadata() to automatically include OG images and Twitter cards
 */

import type { Metadata } from 'next';
import { getOgImage } from './og-image';

interface MetadataOptions {
  title: string;
  description: string;
  /** Which OG image to use - defaults to 'home' */
  ogImageType?: 'home' | 'products' | 'projects' | 'solutions' | 'about' | 'contact' | 'faq';
  /** Custom OG image URL - overrides ogImageType */
  ogImage?: string;
  /** Page URL path (e.g., '/produktai') */
  path?: string;
  /** Additional keywords */
  keywords?: string[];
  /** OpenGraph type - defaults to 'website' */
  type?: 'website' | 'article' | 'product';
}

/**
 * Create metadata with automatic OG images and Twitter cards
 * 
 * @example
 * export const metadata = createMetadata({
 *   title: 'Produktai',
 *   description: 'Browse our products',
 *   ogImageType: 'products',
 *   path: '/produktai',
 * });
 */
export function createMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    ogImageType = 'home',
    ogImage,
    path,
    keywords = [],
    type = 'website',
  } = options;

  const imageUrl = ogImage || getOgImage(ogImageType);
  const url = path ? `https://yakiwood.lt${path}` : 'https://yakiwood.lt';

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    openGraph: {
      title: `${title} | Yakiwood`,
      description,
      url,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Yakiwood`,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Create metadata for dynamic pages (products, projects)
 * Automatically handles custom images
 */
export function createDynamicMetadata(options: {
  title: string;
  description: string;
  image?: string;
  fallbackImageType?: 'products' | 'projects';
  path: string;
  type?: 'website' | 'article' | 'product';
}): Metadata {
  const {
    title,
    description,
    image,
    fallbackImageType = 'products',
    path,
    type = 'website',
  } = options;

  const imageUrl = image || getOgImage(fallbackImageType);

  return {
    title,
    description,
    openGraph: {
      title: `${title} | Yakiwood`,
      description,
      url: `https://yakiwood.lt${path}`,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Yakiwood`,
      description,
      images: [imageUrl],
    },
  };
}
