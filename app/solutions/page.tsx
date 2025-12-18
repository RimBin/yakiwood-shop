'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageCover } from '@/components/shared/PageLayout';

export default function SolutionsPage() {
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState('Facades');

  const filters = ['Facades', 'Interior', 'Terraces', 'Fence'];

  const products = [
    { name: 'Yakiwood Black', type: 'Larch', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Charcoal', type: 'Pine', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Natural', type: 'Spruce', image: '/images/solutions/product-1.jpg' },
    { name: 'Yakiwood Deep', type: 'Oak', image: '/images/solutions/product-1.jpg' },
  ];

  const accordionData = [
    {
      title: 'Introduction to Burnt Wood Facade Cladding',
      content: `Burnt wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is wooden facade cladding that provides a modern and robust appearance. This article, "Burnt Wood for Facades: A Modern and Durable Choice," presents the advantages of burnt wood facade cladding and offers recommendations on how to incorporate this technique into your projects.

Burnt wood not only provides a unique look but is also durable and weather-resistant. Wrapping wood with burnt wood facade cladding can recreate an ancient, natural appearance that is adaptable to all architectural styles. Additionally, burnt wood serves as a natural protection against external factors such as pests and harmful ultraviolet rays from the sun.

Do you want to give your building a distinctive and attractive appearance? Encourage various design solutions with burnt wood. Read this article to learn more about the benefits of burnt wood facades and tips on how to implement it in your projects.`,
    },
    {
      title: 'Advantages of Burnt Wood Facade Cladding',
      content: 'Burnt wood facade cladding offers numerous benefits including enhanced durability, natural weather resistance, and a distinctive aesthetic appeal.',
    },
    {
      title: 'Most Popular Wood Types for Burnt Wood Facade Cladding',
      content: 'Common wood types used for burnt wood cladding include larch, pine, spruce, and oak, each offering unique characteristics and visual appeal.',
    },
    {
      title: 'Installation Process of Burnt Wood Facade Cladding',
      content: 'The installation process involves proper surface preparation, selecting the right mounting system, and ensuring adequate ventilation behind the cladding.',
    },
    {
      title: 'Cost Aspects of Burnt Wood Facade Cladding',
      content: 'While initial costs may be higher than traditional options, the long-term durability and low maintenance requirements make burnt wood an economical choice.',
    },
    {
      title: 'Sustainability and Environmental Protection of Burnt Wood Facade Cladding',
      content: 'Burnt wood is an environmentally friendly option, using natural preservation methods and often sourced from sustainably managed forests.',
    },
    {
      title: 'Conclusion: Is Burnt Wood Board Facade Cladding the Right Choice for Your Project?',
      content: 'Consider your aesthetic preferences, budget, and long-term maintenance plans when deciding if burnt wood cladding is the right choice for your project.',
    },
  ];

  return (
    <div className="bg-[#E1E1E1]">
      {/* Hero Section */}
      <PageCover>
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-[24px] lg:gap-0">
          <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
              style={{ fontVariationSettings: "'opsz' 14" }}>
            <span>Versatile </span>
            <span className="font-['Tiro_Tamil'] italic">solutions</span>
            <span> for every project</span>
          </h1>

          {/* Desktop Chips */}
          <div className="hidden lg:flex gap-[8px]">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                  activeFilter === filter
                    ? 'bg-[#161616] text-white'
                    : 'bg-transparent border border-[#BBBBBB] text-[#161616]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </PageCover>

      {/* Mobile Chips Below Header */}
      <div className="lg:hidden max-w-[1440px] mx-auto px-[16px] md:px-[40px] pt-[24px]">
        <div className="flex gap-[8px] flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`h-[32px] px-[12px] flex items-center justify-center rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase cursor-pointer transition-all ${
                  activeFilter === filter
                    ? 'bg-[#161616] text-white'
                    : 'bg-transparent border border-[#BBBBBB] text-[#161616]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] py-[40px] lg:py-[80px]">
        {/* Big Text - left aligned with first line indent */}
        <p className="font-['DM_Sans'] font-light text-[32px] lg:text-[52px] leading-none tracking-[-1.28px] lg:tracking-[-2.08px] text-[#161616] text-left indent-[80px] lg:indent-[200px] mb-[32px] lg:mb-[48px]">
          Burning wood is an ancient and unique technique that is becoming increasingly popular in modern architecture. The result is a finish of wooden cladding that provides a modern and robust appearance.
        </p>

        {/* Small Text - offset to right on desktop */}
        <div className="lg:ml-[25%] font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[557px] mb-[48px] lg:mb-[80px]">
          <p className="mb-[10px]">
            Charred wood cladding not only provides a unique appearance but is also durable and resistant to weather conditions. By properly charring the wood, a modern, nature-inspired aesthetic can be created, suitable for all architectural styles. Furthermore, charred wood serves as a natural defence against external influences, such as pests or harmful ultraviolet rays from the sun.
          </p>
          <p>Do you want to give your building a distinctive and appealing look? Encourage diverse design solutions with charred wood.</p>
        </div>

        {/* Hero Image - full width */}
        <div className="relative w-full h-[200px] lg:h-[758px]">
          <Image
            src="/images/solutions/hero.jpg"
            alt="Modern architecture with burnt wood cladding"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Accordion Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pb-[64px] lg:pb-[80px]">
        <div className="lg:flex">
          {/* FAQ Eyebrow - left column, same width as Products offset */}
          <div className="hidden lg:block lg:w-[25%] flex-shrink-0">
            <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
              FAQ
            </span>
          </div>

          {/* Accordion - right column, aligned with Products */}
          <div className="lg:w-[75%]">
            {/* Mobile eyebrow */}
            <div className="lg:hidden mb-[24px]">
              <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                FAQ
              </span>
            </div>

            {accordionData.map((item, index) => (
              <div key={index}>
                <div className="h-[1px] bg-[#BBBBBB] my-[8px]" />
              
              <button
                onClick={() => setOpenAccordionIndex(openAccordionIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-[4px] cursor-pointer bg-transparent border-none text-left"
              >
                <span className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]">
                  {item.title}
                </span>
                
                <div className="w-[20px] h-[20px] relative flex items-center justify-center">
                  <div className="absolute w-[13.75px] h-[1px] bg-[#161616]" />
                  <div
                    className={`absolute w-[1px] h-[13.75px] bg-[#161616] transition-transform duration-200 ${
                      openAccordionIndex === index ? 'rotate-90' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {openAccordionIndex === index && (
                <div className="pt-[8px] pb-[4px]">
                  <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[672px] whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div className="h-[1px] bg-[#BBBBBB] my-[8px]" />
        </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pb-[80px] lg:pb-[120px]">
        <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-1.6px] lg:tracking-[-3.2px] text-[#161616] mb-[40px] lg:mb-[64px] lg:ml-[25%]">
          Products
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[16px]">
          {products.map((product, index) => (
            <div
              key={index}
              className="border border-[#BBBBBB] rounded-[8px] p-[16px] flex flex-col gap-[16px] lg:w-[328px]"
            >
              <div className="relative w-full h-[250px] rounded-[8px] overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-col gap-[4px]">
                <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                  {product.name}
                </p>
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#535353]">
                  {product.type}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[120px] lg:pt-[200px] pb-[200px] lg:pb-[350px] relative">
        {/* Background Image */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[625px] lg:w-[1099px] h-[599px] lg:h-[1053px] opacity-15 mix-blend-luminosity pointer-events-none">
          <Image
            src="/images/solutions/cta-background.jpg"
            alt=""
            fill
            className="object-contain"
          />
        </div>

        {/* CTA Content */}
        <div className="relative z-10 flex flex-col items-center gap-[40px] lg:gap-[64px]">
          <h2 className="font-['DM_Sans'] font-light text-[45px] lg:text-[128px] leading-[0.95] tracking-[-1.8px] lg:tracking-[-6.4px] text-[#161616] text-center max-w-[358px] lg:max-w-[861px] m-0">
            Ready to{' '}
            <span className="font-['Tiro_Tamil'] italic">build</span>{' '}
            with fire?
          </h2>

          <div className="flex flex-col lg:flex-row gap-[16px] items-center w-full lg:w-auto">
            <button className="h-[48px] px-[40px] bg-[#161616] rounded-[100px] border-none font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase text-white cursor-pointer transition-colors hover:bg-[#2a2a2a] w-full lg:w-auto">
              Get an offer
            </button>

            <button className="h-[48px] px-[40px] bg-transparent border border-[#161616] rounded-[100px] font-['Outfit'] text-[12px] font-normal tracking-[0.6px] uppercase text-[#161616] cursor-pointer transition-all hover:bg-[#161616] hover:text-white w-full lg:w-auto">
              Get in touch
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
