/**
 * Sanity Image URL Builder
 * Utility for generating optimized image URLs from Sanity
 */

import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';

const builder = imageUrlBuilder(sanityClient);

/**
 * Generate optimized image URL from Sanity image source
 */
export function urlFor(source: any) {
  return builder.image(source);
}

/**
 * Generate responsive image URLs for different sizes
 */
export function getResponsiveImageUrls(source: any) {
  return {
    small: urlFor(source).width(400).url(),
    medium: urlFor(source).width(800).url(),
    large: urlFor(source).width(1200).url(),
    xlarge: urlFor(source).width(1920).url(),
  };
}
