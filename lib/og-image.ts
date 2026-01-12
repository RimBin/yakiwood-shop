/**
 * Open Graph Image Helper
 * Uses existing content images for OG metadata
 */

import { getAsset } from './assets';

/**
 * Get Open Graph image for a page
 * Uses existing content images - no need to create new ones!
 */
export function getOgImage(page: 'home' | 'products' | 'projects' | 'solutions' | 'about' | 'contact' | 'faq'): string {
  // Keep OG URLs HTTPS so canonicals/social previews are consistent.
  // In local dev you might have NEXT_PUBLIC_SITE_URL=http://localhost:xxxx;
  // that would produce non-HTTPS OG URLs which our SEO validator flags.
  const envBase = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = envBase && envBase.startsWith('https://') ? envBase : 'https://yakiwood.lt';
  
  // Map pages to existing asset images
  const ogImages: Record<string, string> = {
    home: getAsset('imgProject1'), // Use first project as hero image
    products: getAsset('imgFacades'), // Use facades category image
    projects: getAsset('imgProject2'), // Use second project image
    solutions: getAsset('imgTerrace'), // Use terrace solution image
    about: getAsset('imgProject3'), // Use third project image
    contact: getAsset('imgInterior'), // Use interior image
    faq: getAsset('imgProject1'), // Fallback to homepage hero
  };

  const imagePath = ogImages[page] || ogImages.home;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise prepend base URL
  return `${baseUrl}${imagePath}`;
}

/**
 * Get OG image for dynamic product page
 * Uses product's own image if available
 */
export function getProductOgImage(imageUrl?: string): string {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = envBase && envBase.startsWith('https://') ? envBase : 'https://yakiwood.lt';
  
  if (imageUrl) {
    // If Sanity image URL or external URL, return it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If local path, prepend base URL
    return `${baseUrl}${imageUrl}`;
  }
  
  // Fallback to default product image
  return getOgImage('products');
}

/**
 * Get OG image for dynamic project page
 * Uses project's own image if available
 */
export function getProjectOgImage(imageUrl?: string): string {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL;
  const baseUrl = envBase && envBase.startsWith('https://') ? envBase : 'https://yakiwood.lt';
  
  if (imageUrl) {
    // If external URL, return it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // If local path, prepend base URL
    return `${baseUrl}${imageUrl}`;
  }
  
  // Fallback to default project image
  return getOgImage('projects');
}
