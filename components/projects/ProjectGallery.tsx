'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface ProjectGalleryProps {
  images: string[];
  title: string;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Calculate visible images for desktop (prev, current, next)
  const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;

  return (
    <div className="w-full">
      {/* Gallery */}
      <div className="relative w-full overflow-hidden">
        <div className="flex gap-4 items-center justify-center lg:gap-4 px-4 lg:px-0">
          {/* Desktop: 3 images with opacity */}
          <div className="hidden lg:flex gap-4 items-center justify-center w-full max-w-[1440px] mx-auto">
            {/* Previous image */}
            <div className="relative h-[543px] w-[350px] rounded-lg overflow-hidden opacity-30">
              <Image
                src={images[prevIndex]}
                alt={`${title} - Image ${prevIndex + 1}`}
                fill
                className="object-cover"
                sizes="350px"
              />
            </div>
            {/* Current image */}
            <div className="relative h-[543px] w-[673px] rounded-lg overflow-hidden">
              <Image
                src={images[currentIndex]}
                alt={`${title} - Image ${currentIndex + 1}`}
                fill
                className="object-cover"
                sizes="673px"
                priority
              />
            </div>
            {/* Next image */}
            <div className="relative h-[543px] w-[350px] rounded-lg overflow-hidden opacity-30">
              <Image
                src={images[nextIndex]}
                alt={`${title} - Image ${nextIndex + 1}`}
                fill
                className="object-cover"
                sizes="350px"
              />
            </div>
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="flex lg:hidden gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full">
            {images.map((image, idx) => (
              <div
                key={idx}
                className={`relative h-[275px] min-w-[342px] rounded snap-start ${
                  idx === currentIndex ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <Image
                  src={image}
                  alt={`${title} - Image ${idx + 1}`}
                  fill
                  className="object-cover rounded"
                  sizes="342px"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 px-4 lg:px-0">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[#161616] flex items-center justify-center hover:bg-[#535353] hover:text-white transition-colors"
          aria-label="Previous image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="lg:w-6 lg:h-6">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Page Numbers */}
        <span className="font-['DM_Sans'] font-medium text-[#7C7C7C] text-[11px] sm:text-sm uppercase tracking-[0.42px]">
          {currentIndex + 1}
        </span>
        <span className="font-['DM_Sans'] font-medium text-[#161616] text-[11px] sm:text-sm uppercase tracking-[0.42px]">
          {Math.min(currentIndex + 2, images.length)}
        </span>

        {/* Progress Bar */}
        <div className="w-[96px] sm:w-[140px] lg:w-[160px] h-[1.5px] bg-[#EAEAEA] relative">
          <div
            className="absolute top-0 left-0 h-full bg-[#161616] transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          />
        </div>

        <span className="font-['DM_Sans'] font-medium text-[#7C7C7C] text-[11px] sm:text-sm uppercase tracking-[0.42px]">
          {images.length - 1}
        </span>
        <span className="font-['DM_Sans'] font-medium text-[#7C7C7C] text-[11px] sm:text-sm uppercase tracking-[0.42px]">
          {images.length}
        </span>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border border-[#161616] flex items-center justify-center hover:bg-[#535353] hover:text-white transition-colors"
          aria-label="Next image"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="lg:w-6 lg:h-6">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
