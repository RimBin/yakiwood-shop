'use client';

import Image from 'next/image';
import { useState } from 'react';
import { generateBlurDataURL, getImageQuality } from '@/lib/image-optimizer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  imageType?: 'hero' | 'product' | 'thumbnail' | 'icon';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  onLoad?: () => void;
}

/**
 * OptimizedImage Component
 * 
 * Wrapper around Next.js Image component with:
 * - Loading state with skeleton
 * - Blur placeholder
 * - Optimized quality settings
 * - Proper sizes attribute
 * - Error handling
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes,
  quality,
  imageType = 'product',
  objectFit = 'cover',
  onLoad,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Use provided quality or get optimal based on image type
  const imageQuality = quality || getImageQuality(imageType);

  // Generate blur placeholder
  const blurDataURL = generateBlurDataURL(width, height);

  // Default sizes if not provided
  const imageSizes = sizes || (
    imageType === 'hero' 
      ? '100vw'
      : imageType === 'thumbnail'
      ? '100px'
      : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  );

  const handleLoadingComplete = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div
        className={`relative bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative ${isLoading ? 'animate-pulse bg-gray-200' : ''} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={imageQuality}
        sizes={imageSizes}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={handleLoadingComplete}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          objectFit,
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
