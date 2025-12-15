/**
 * Image Optimization Utilities
 * 
 * Provides utilities for image optimization, sizing, and placeholder generation.
 * Works with Next.js Image component for optimal performance.
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
}

/**
 * Generate responsive image sizes string for next/image
 * Based on common breakpoints
 */
export function getImageSizes(breakpoints: number[] = [640, 768, 1024, 1280, 1536]): string {
  const sizes: string[] = [];
  
  // Mobile: full width
  sizes.push('(max-width: 640px) 100vw');
  
  // Tablet: 2 columns
  sizes.push('(max-width: 768px) 50vw');
  
  // Desktop: 3 columns
  sizes.push('(max-width: 1024px) 33vw');
  
  // Large desktop: 4 columns
  sizes.push('25vw');
  
  return sizes.join(', ');
}

/**
 * Generate image sizes for hero/banner images
 */
export function getHeroImageSizes(): string {
  return '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px';
}

/**
 * Generate image sizes for product cards
 */
export function getProductCardSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
}

/**
 * Generate image sizes for product detail images
 */
export function getProductDetailSizes(): string {
  return '(max-width: 768px) 100vw, 50vw';
}

/**
 * Generate image sizes for thumbnails
 */
export function getThumbnailSizes(): string {
  return '(max-width: 640px) 25vw, 100px';
}

/**
 * Get optimal image quality based on image type
 */
export function getImageQuality(type: 'hero' | 'product' | 'thumbnail' | 'icon'): number {
  switch (type) {
    case 'hero':
      return 85; // High quality for hero images
    case 'product':
      return 80; // Good quality for product images
    case 'thumbnail':
      return 75; // Lower quality for thumbnails
    case 'icon':
      return 90; // High quality for small icons
    default:
      return 80;
  }
}

/**
 * Calculate aspect ratio from width and height
 */
export function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Generate blur data URL for placeholder
 * Returns a simple base64 encoded SVG as placeholder
 */
export function generateBlurDataURL(width: number, height: number, color: string = '#e1e1e1'): string {
  const svg = `
    <svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g">
          <stop stop-color="${color}" offset="0%" />
          <stop stop-color="${adjustBrightness(color, -10)}" offset="100%" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `;
  
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Adjust color brightness for gradients
 */
function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Check if image URL is from Figma
 */
export function isFigmaImage(url: string): boolean {
  return url.includes('figma.com') || url.includes('figma-alpha.com');
}

/**
 * Get optimal loader for image source
 */
export function getImageLoader(src: string): 'default' | 'cloudinary' | 'imgix' | 'custom' {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    if (isFigmaImage(src)) return 'custom';
    if (src.includes('cloudinary.com')) return 'cloudinary';
    if (src.includes('imgix.net')) return 'imgix';
  }
  return 'default';
}

/**
 * Image optimization recommendations
 */
export interface ImageOptimizationRecommendation {
  originalSize: number;
  estimatedSize: number;
  savings: number;
  recommendations: string[];
}

export function getOptimizationRecommendations(
  width: number,
  height: number,
  format: string
): ImageOptimizationRecommendation {
  const originalSize = width * height * 3; // Rough estimate in bytes
  let estimatedSize = originalSize;
  const recommendations: string[] = [];
  
  // Format optimization
  if (format !== 'webp' && format !== 'avif') {
    recommendations.push('Convert to WebP or AVIF format for 25-35% smaller file size');
    estimatedSize *= 0.7;
  }
  
  // Dimension optimization
  if (width > 1920 || height > 1080) {
    recommendations.push('Reduce dimensions to maximum 1920x1080 for web display');
    const scaleFactor = Math.min(1920 / width, 1080 / height);
    estimatedSize *= scaleFactor * scaleFactor;
  }
  
  // Quality optimization
  recommendations.push('Use quality 80-85 for optimal balance between size and quality');
  
  const savings = originalSize - estimatedSize;
  const savingsPercent = Math.round((savings / originalSize) * 100);
  
  return {
    originalSize: Math.round(originalSize / 1024), // KB
    estimatedSize: Math.round(estimatedSize / 1024), // KB
    savings: savingsPercent,
    recommendations,
  };
}

/**
 * Prefetch image for better perceived performance
 */
export function prefetchImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch prefetch multiple images
 */
export async function prefetchImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(prefetchImage));
}
