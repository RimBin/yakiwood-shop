'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ArrowRight from '@/components/icons/ArrowRight';
import { PageCover } from '@/components/shared/PageLayout';

export default function AboutNew() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          About us
        </h1>
      </PageCover>
      
      <section className="w-full bg-[#E1E1E1]">
        <div className="mx-auto max-w-[1440px] px-[24px] py-[80px] lg:px-[40px] lg:py-[120px]">
          <div className="flex flex-col gap-[48px]">
            {/* Heading */}
            <div className="flex flex-col gap-[16px]">
              <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Our Story</p>
              <h2 className="font-['DM_Sans'] text-[40px] font-light leading-[1.1] tracking-[-1.6px] text-[#161616] lg:text-[56px] lg:tracking-[-2.24px]">
                At Yakiwood, we are experts in the preparation of burnt wood, specializing in facades, terraces, and interior solutions that guarantee high-quality, long-lasting results using natural, time-tested woodworking methods.
              </h2>
            </div>

            {/* Hero Image */}
            <div className="relative h-[300px] w-full overflow-hidden rounded-[12px] lg:h-[520px]">
              <Image
                src="https://s3-alpha-sig.figma.com/img/a7d5/d8ee/1f9e3c1e0a7c5b4d8f9e6a3c2b1d0e9f?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=placeholder"
                alt="Burnt wood craftsmanship"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Guided by tradition Section */}
      <section className="w-full bg-[#161616]">
        <div className="mx-auto max-w-[1440px] px-[24px] py-[80px] lg:px-[40px] lg:py-[120px]">
          <div className="flex flex-col gap-[48px] lg:gap-[64px]">
            {/* Section Heading */}
            <h2 className="font-['DM_Sans'] text-[40px] font-light leading-[1.1] tracking-[-1.6px] text-white lg:text-[56px] lg:tracking-[-2.24px]">
              Guided by tradition<br />
              driven by <span className="font-['Tiro_Tamil'] italic">purpose</span>
            </h2>

            {/* Values Grid */}
            <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-3 lg:gap-[48px]">
              {/* Value 1 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Sustainability
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  We use natural fire treatment methods that extend the life of wood without harmful chemicals, making our products eco-friendly and sustainable.
                </p>
              </div>

              {/* Value 2 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Craftsmanship
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  Our team of skilled artisans brings years of experience to every project, ensuring exceptional quality and attention to detail in every piece.
                </p>
              </div>

              {/* Value 3 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Innovation
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  While respecting traditional techniques, we continuously innovate to improve our processes and deliver cutting-edge solutions for modern applications.
                </p>
              </div>

              {/* Value 4 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Quality
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  We never compromise on quality. Every product undergoes rigorous quality checks to ensure it meets our high standards before reaching our customers.
                </p>
              </div>

              {/* Value 5 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Reliability
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  Our clients trust us to deliver on time, every time. We pride ourselves on being a dependable partner for all your wood treatment needs.
                </p>
              </div>

              {/* Value 6 */}
              <div className="flex flex-col gap-[16px]">
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-white">
                  Passion
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#BBBBBB]">
                  We love what we do, and it shows in our work. Our passion for burnt wood craftsmanship drives us to create products that inspire and endure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="w-full bg-[#E1E1E1]">
        <div className="mx-auto max-w-[1440px] px-[24px] py-[80px] lg:px-[40px] lg:py-[120px]">
          <div className="flex flex-col gap-[48px] lg:gap-[64px]">
            {/* Section Heading */}
            <h2 className="font-['DM_Sans'] text-[40px] font-light leading-[1.1] tracking-[-1.6px] text-[#161616] lg:text-[56px] lg:tracking-[-2.24px]">
              The art of <span className="font-['Tiro_Tamil'] italic">burnt wood:</span><br />
              our process
            </h2>

            {/* Process Steps */}
            <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-2 lg:gap-x-[80px] lg:gap-y-[48px]">
              {/* Step 1 */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">01. Selection</p>
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-[#161616]">
                  Choosing the right wood
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#535353]">
                  We carefully select high-quality wood species that are best suited for fire treatment, ensuring durability and beautiful results.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">02. Preparation</p>
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-[#161616]">
                  Preparing for treatment
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#535353]">
                  The wood is carefully prepared, ensuring optimal moisture content and surface condition before the burning process begins.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">03. Burning</p>
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-[#161616]">
                  The fire treatment
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#535353]">
                  Using traditional Shou Sugi Ban techniques, we carefully burn the wood surface to create a protective carbonized layer that enhances both beauty and durability.
                </p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col gap-[12px]">
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">04. Finishing</p>
                <h3 className="font-['DM_Sans'] text-[24px] font-medium tracking-[-0.48px] text-[#161616]">
                  Final touches
                </h3>
                <p className="font-['Outfit'] text-[14px] font-light leading-[1.5] tracking-[0.14px] text-[#535353]">
                  After burning, we brush and finish the wood to achieve the desired texture and appearance, followed by optional oil treatment for added protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-[#E1E1E1]">
        <div className="mx-auto max-w-[1440px] px-[24px] pb-[80px] lg:px-[40px] lg:pb-[120px]">
          <div className="flex flex-col gap-[48px]">
            {/* Section Heading */}
            <h2 className="font-['DM_Sans'] text-[40px] font-light leading-[1.1] tracking-[-1.6px] text-[#161616] lg:text-[56px] lg:tracking-[-2.24px]">
              Meet the <span className="font-['Tiro_Tamil'] italic">experts</span> behind<br />
              Yakiwood
            </h2>

            {/* Team Grid */}
            <div className="grid grid-cols-1 gap-[24px] sm:grid-cols-2 lg:grid-cols-4">
              {/* Team Member 1 */}
              <div className="flex flex-col gap-[12px]">
                <div className="relative h-[400px] w-full overflow-hidden rounded-[12px] bg-[#D9D9D9]">
                  <Image
                    src="https://s3-alpha-sig.figma.com/img/placeholder1?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=placeholder"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">
                    Name Surname
                  </p>
                  <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                    Position
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="flex flex-col gap-[12px]">
                <div className="relative h-[400px] w-full overflow-hidden rounded-[12px] bg-[#D9D9D9]">
                  <Image
                    src="https://s3-alpha-sig.figma.com/img/placeholder2?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=placeholder"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">
                    Name Surname
                  </p>
                  <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                    Position
                  </p>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="flex flex-col gap-[12px]">
                <div className="relative h-[400px] w-full overflow-hidden rounded-[12px] bg-[#D9D9D9]">
                  <Image
                    src="https://s3-alpha-sig.figma.com/img/placeholder3?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=placeholder"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">
                    Name Surname
                  </p>
                  <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                    Position
                  </p>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="flex flex-col gap-[12px]">
                <div className="relative h-[400px] w-full overflow-hidden rounded-[12px] bg-[#D9D9D9]">
                  <Image
                    src="https://s3-alpha-sig.figma.com/img/placeholder4?Expires=1735516800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=placeholder"
                    alt="Team member"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['DM_Sans'] text-[18px] font-medium tracking-[-0.36px] text-[#161616]">
                    Name Surname
                  </p>
                  <p className="font-['Outfit'] text-[14px] font-light tracking-[0.14px] text-[#535353]">
                    Position
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative w-full overflow-hidden bg-[#E1E1E1]">
        <div className="mx-auto max-w-[1440px] px-[24px] py-[80px] lg:px-[40px] lg:py-[120px]">
          <div className="relative z-10 flex flex-col items-center gap-[32px] text-center">
            {/* Heading */}
            <h2 className="font-['DM_Sans'] text-[40px] font-light leading-[1.1] tracking-[-1.6px] text-[#161616] lg:text-[64px] lg:tracking-[-2.56px]">
              Ready to <span className="font-['Tiro_Tamil'] italic">build</span><br />
              with fire?
            </h2>

            {/* Buttons */}
            <div className="flex flex-col gap-[16px] sm:flex-row">
              <Link
                href="/kontaktai"
                className="flex items-center justify-center gap-[12px] rounded-[100px] bg-[#161616] px-[32px] py-[16px] text-white transition-opacity hover:opacity-90"
              >
                <span className="font-['Outfit'] text-[14px] font-normal uppercase tracking-[0.7px]">
                  Contact us
                </span>
                <ArrowRight color="#FFFFFF" />
              </Link>
              <Link
                href="/produktai"
                className="flex items-center justify-center gap-[12px] rounded-[100px] border border-[#161616] bg-transparent px-[32px] py-[16px] text-[#161616] transition-colors hover:bg-[#161616] hover:text-white"
              >
                <span className="font-['Outfit'] text-[14px] font-normal uppercase tracking-[0.7px]">
                  View products
                </span>
              </Link>
            </div>
          </div>

          {/* Background Circle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-[#D9D9D9]/30 to-transparent opacity-40 lg:h-[900px] lg:w-[900px]" />
        </div>
      </section>
    </div>
  );
}
