'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ImageGalleryProps {
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
  backgroundColor?: string;
}

export default function ImageGallery({ images, backgroundColor = '#bbab92' }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Main Image */}
      <div className="relative overflow-hidden w-full">
        <div
          className="flex gap-2 transition-transform duration-300 ease-in-out overflow-x-auto snap-x snap-mandatory"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-shrink-0 w-[328px] lg:w-full h-[400px] lg:h-[500px] snap-center relative"
              style={{ backgroundColor }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex gap-2 items-center justify-center">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-[#161616]' : 'bg-[#bbbbbb]'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
