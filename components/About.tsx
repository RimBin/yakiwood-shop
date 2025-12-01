'use client';

import Image from 'next/image';
import Link from 'next/link';

// Image assets from Figma
const imgVideo = "https://www.figma.com/api/mcp/asset/477aa6a4-49f3-44f4-8e9a-ebf0bfe0cd06";
const imgTeam1 = "https://www.figma.com/api/mcp/asset/bf70d331-5e28-461f-8c66-0da654728647";
const imgTeam2 = "https://www.figma.com/api/mcp/asset/87885949-1e42-4fa2-ac0e-c161d0979163";
const imgTeam3 = "https://www.figma.com/api/mcp/asset/2bcc8d00-1d2e-4322-bef2-c14fa440d13a";
const imgTeam4 = "https://www.figma.com/api/mcp/asset/db641b47-8ed9-40bc-91f0-d8baa158f56a";
const imgCTA = "https://www.figma.com/api/mcp/asset/77b31476-e23e-4535-9de2-4ddf313eab32";

export default function About() {
  return (
    <div className="w-full bg-[#E1E1E1]">
      {/* Cover Section */}
      <div className="border-b border-[#BBBBBB]">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[24px] md:pt-[40px] lg:pt-[48px] pb-[24px] md:pb-[40px] lg:pb-[48px]">
          <p className="font-['DM_Sans'] font-light text-[45px] md:text-[96px] lg:text-[128px] leading-[45px] md:leading-[0.95] lg:leading-[0.95] tracking-[-1.8px] md:tracking-[-4.8px] lg:tracking-[-6.4px] text-[#161616]">
            About us
          </p>
        </div>
      </div>

      {/* About Us Description Section */}
      <section className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] pt-[24px] md:pt-[64px] lg:pt-[96px] pb-[24px] md:pb-[0px]">
        <div className="relative lg:min-h-[456px]">
          {/* Big heading text with leading spaces to create indent - matches Figma exactly */}
          <p className="font-['DM_Sans'] font-light text-[32px] md:text-[42px] lg:text-[52px] leading-[32px] md:leading-[42px] lg:leading-[52px] tracking-[-1.28px] md:tracking-[-1.68px] lg:tracking-[-2.08px] text-[#161616] lg:whitespace-pre-wrap m-0">
{`                            At Yakiwood, we are experts in the preparation of burnt wood, specializing in facades, terraces, fences, and interiors. With years of experience, we guarantee high-quality, long-lasting results using a natural, time-tested woodworking method.`}
          </p>
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full lg:max-w-[309px] mt-[16px] lg:mt-0 lg:absolute lg:top-[212px] lg:left-1/2 lg:translate-x-[96px]">
            We produce wood prepared according to the unique, time-tested Japanese wood-burning technology "Yakisugi" (or "Shou Sugi Ban"). This is the most natural way of preparing wood, giving it both a protective and aesthetic function. The traditional Japanese woodworking technology, which has been around for centuries, was introduced to protect wood from the effects of the environment. Burning shrinks the pores in the surface of the wood, making it stronger and more resistant. At the same time, it retains its properties, naturalness, pattern and colour.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <div className="relative md:pt-5 lg:pt-[56px]">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#161616]"></div>
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] relative z-10">
          <div className="relative h-[200px] md:h-[450px] lg:h-[642px] w-full rounded-[8px] overflow-hidden">
            <Image
              src={imgVideo}
              alt="Yakiwood process video"
              fill
              className="object-cover"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgba(255,255,255,0.2)] rounded-[100px] w-[59px] h-[59px] md:w-[100px] md:h-[100px] flex items-center justify-center z-10">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                Watch
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Foundations Section */}
      <div className="bg-[#161616] pt-[64px] md:pt-[80px] lg:pt-[180px] pb-[64px] md:pb-[80px] lg:pb-[200px] w-full">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] relative">
          {/* Title */}
          <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-white lg:mt-[26px]">
              Our foundations
            </p>
            <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[64px] lg:text-[80px] leading-none tracking-[-2px] md:tracking-[-3.2px] lg:tracking-[-4.4px] text-white lg:justify-self-start lg:max-w-[672px]">
              Guided by tradition, driven by <span className="font-['Tiro_Tamil'] italic">purpose</span>
            </h2>
          </div>

          {/* Cards Grid - 4 columns layout matching Figma */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-[16px]">
            {/* Row 1: col1 bordered, col2 empty, col3 bordered, col4 no border */}
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our mission
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                Our goal is to help you create a cosy and sustainable environment by using Yakisugi (Shou Sugi Ban)—a traditional Japanese wood-burning technique that enhances both the protection and aesthetics of wood.
              </p>
            </div>
            
            {/* Empty gap - column 2 */}
            <div className="h-[300px]"></div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our Vision
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                To become the leading provider of sustainable burnt wood solutions in Lithuania and beyond, inspiring people to embrace natural, durable, and eco-friendly materials in architecture and interior design. We strive to preserve tradition while innovating for a greener future.
              </p>
            </div>

            {/* No border - column 4 */}
            <div className="p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                We produce burnt wood products using the centuries-old Japanese method that naturally strengthens and preserves wood by shrinking its pores. This process enhances durability while maintaining the wood's natural texture, pattern, and color.
              </p>
            </div>

            {/* Row 2: col1 no border, col2 bordered, col3 bordered, col4 empty */}
            {/* No border - column 1 */}
            <div className="p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-white">
                Our skilled craftsmen are meticulous in their work, ensuring every detail meets the highest quality standards. We use the most durable woods—spruce, pine, and larch, treated with natural oils to achieve exceptional colors and protection.
              </p>
            </div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our mission
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                Our goal is to help you create a cosy and sustainable environment by using Yakisugi (Shou Sugi Ban)—a traditional Japanese wood-burning technique that enhances both the protection and aesthetics of wood.
              </p>
            </div>

            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px] h-[300px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our values
              </p>
              <div className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Craftsmanship</span><span className="font-['Outfit'] font-light text-[14px]"> – We take pride in our work, paying close attention to every detail to ensure the highest quality.</span>
                </p>
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Sustainability</span><span className="font-['Outfit'] font-light text-[14px]"> – We believe in eco-friendly solutions that preserve nature while enhancing your living space.</span>
                </p>
                <p>
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Authenticity</span><span className="font-['Outfit'] font-light text-[14px]"> – We honor the centuries-old Yakisugi tradition, delivering wood that retains its natural beauty and strength.</span>
                </p>
              </div>
            </div>

            {/* Empty gap - column 4 */}
            <div className="h-[300px]"></div>
          </div>

          {/* Mobile Cards - stacked */}
          <div className="lg:hidden flex flex-col gap-[16px]">
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our mission
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                Our goal is to help you create a cosy and sustainable environment by using Yakisugi (Shou Sugi Ban)—a traditional Japanese wood-burning technique that enhances both the protection and aesthetics of wood.
              </p>
            </div>
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our Vision
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                To become the leading provider of sustainable burnt wood solutions in Lithuania and beyond, inspiring people to embrace natural, durable, and eco-friendly materials. We strive to preserve tradition while innovating for a greener future.
              </p>
            </div>
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our promise
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                Whether for facades, terraces, fences, or interior designs, our burnt wood solutions add warmth, style, and lasting protection to your home and surroundings.
              </p>
            </div>
            <div className="border border-[#535353] p-[24px] flex flex-col gap-[16px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-white">
                Our values
              </p>
              <div className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB]">
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Craftsmanship</span> – We take pride in our work, paying close attention to every detail.
                </p>
                <p className="mb-[10px]">
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Sustainability</span> – We believe in eco-friendly solutions that preserve nature.
                </p>
                <p>
                  <span className="font-['DM_Sans'] font-medium text-[16px] leading-[1.1] tracking-[-0.64px]">Authenticity</span> – We honor the centuries-old Yakisugi tradition.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="bg-[#E1E1E1] pt-[64px] md:pt-[80px] lg:pt-[200px] pb-[64px] md:pb-[80px] lg:pb-[80px] w-full">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px]">
          {/* Title */}
          <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] lg:mt-[26px]">
              Our process
            </p>
            <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[80px] leading-none tracking-[-2px] md:tracking-[-4.4px] text-[#161616] lg:justify-self-start lg:max-w-[767px]">
              The art of <span className="font-['Tiro_Tamil'] italic">burnt wood:</span> our process
            </h2>
          </div>

          {/* Description texts - Desktop positioned to match Figma */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,344px)_minmax(0,1fr)] lg:gap-0 mb-[48px]">
            <div></div>
            <div className="flex gap-[68px]">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[276px]">
                Burnt wood is produced by burning wood at high temperatures in a special kiln, creating a natural and picturesque wood surface. This process gives the wood unique textures and colors, increases its resistance to moisture and fire
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] max-w-[294px]">
                So, if you want to give your home or business premises a special and eco-friendly finish, it is worth taking a look at burnt wood. It will give the interior a unique and stylish look, while at the same time helping to contribute to environmental protection.
              </p>
            </div>
          </div>

          {/* Mobile description */}
          <div className="lg:hidden mb-[32px]">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
              Burnt wood is produced by burning wood at high temperatures in a special kiln, creating a natural and picturesque wood surface. This process gives the wood unique textures and colors, increases its resistance to moisture and fire.
            </p>
          </div>

          {/* Process steps - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-[minmax(0,344px)_minmax(0,1fr)] lg:gap-0">
            <div></div>
            <div className="w-full max-w-[672px]">
              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  Wood preparation
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  First, the boards are prepared, dust and dirt are removed.
                </p>
              </div>

              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  Burning and combing
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  The wood is heated to very high temperatures, which gives the board unique textures and colors.
                </p>
              </div>

              <div className="border-t border-[#7C7C7C] py-[16px] flex justify-between items-start gap-[24px]">
                <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                  Oil coating
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-full max-w-[328px]">
                  When the board is completely cooled, it is processed and coated with a protective layer.
                </p>
              </div>
              <div className="border-t border-[#7C7C7C]" />
            </div>
          </div>

          {/* Process steps - Mobile */}
          <div className="lg:hidden">
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                Wood preparation
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                First, the boards are prepared, dust and dirt are removed.
              </p>
            </div>
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                Burning and combing
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                The wood is heated to very high temperatures, which gives the board unique textures and colors.
              </p>
            </div>
            <div className="border-t border-[#7C7C7C] py-[16px] flex flex-col gap-[8px]">
              <p className="font-['Outfit'] font-normal text-[14px] leading-[1.1] uppercase tracking-[0.42px] text-[#161616]">
                Oil coating
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353]">
                When the board is completely cooled, it is processed and coated with a protective layer.
              </p>
            </div>
            <div className="border-t border-[#7C7C7C]" />
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-[#E1E1E1] pt-[64px] md:pt-[80px] lg:pt-[144px] pb-[64px] md:pb-[80px] lg:pb-[200px] w-full">
        <div className="max-w-[1440px] mx-auto px-[16px] md:px-[40px]">
          {/* Title */}
          <div className="mb-[32px] md:mb-[48px] grid grid-cols-1 gap-[12px] lg:grid-cols-[344px_auto] lg:items-start lg:gap-0">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] lg:mt-[26px]">
              Our teem
            </p>
            <h2 className="font-['DM_Sans'] font-light text-[40px] md:text-[80px] leading-none tracking-[-2px] md:tracking-[-4.4px] text-[#161616] lg:justify-self-start lg:max-w-[814px]">
              Meet the <span className="font-['Tiro_Tamil'] italic">experts</span> behind Yakiwood
            </h2>
          </div>

          {/* Team Grid - Desktop */}
          <div className="hidden lg:flex gap-[16px]">
            {/* Team Member 1 */}
            <div className="flex flex-col gap-[8px] w-[328px]">
              <div className="relative h-[434px] w-full overflow-hidden">
                <Image
                  src={imgTeam1}
                  alt="Team member"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                Full name
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                Director
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="flex flex-col gap-[8px] w-[328px]">
              <div className="relative h-[434px] w-full overflow-hidden">
                <Image
                  src={imgTeam2}
                  alt="Team member"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                Full name
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                Director
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="flex flex-col gap-[8px] w-[328px]">
              <div className="relative h-[434px] w-full overflow-hidden">
                <Image
                  src={imgTeam3}
                  alt="Team member"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                Full name
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                Director
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="flex flex-col gap-[8px] w-[328px]">
              <div className="relative h-[434px] w-full overflow-hidden">
                <Image
                  src={imgTeam4}
                  alt="Team member"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-[#161616]">
                Full name
              </p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">
                Director
              </p>
            </div>
          </div>

          {/* Team Grid - Mobile: 2 columns */}
          <div className="lg:hidden grid grid-cols-2 gap-[16px]">
            <div className="flex flex-col gap-[8px]">
              <div className="relative h-[218px] w-full overflow-hidden">
                <Image src={imgTeam1} alt="Team member" fill className="object-cover" />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">Full name</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">Director</p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="relative h-[218px] w-full overflow-hidden">
                <Image src={imgTeam2} alt="Team member" fill className="object-cover" />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">Full name</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">Director</p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="relative h-[218px] w-full overflow-hidden">
                <Image src={imgTeam3} alt="Team member" fill className="object-cover" />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">Full name</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">Director</p>
            </div>
            <div className="flex flex-col gap-[8px]">
              <div className="relative h-[218px] w-full overflow-hidden">
                <Image src={imgTeam4} alt="Team member" fill className="object-cover" />
              </div>
              <p className="font-['DM_Sans'] font-medium text-[16px] leading-[1.2] tracking-[-0.32px] text-[#161616]">Full name</p>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616]">Director</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative h-[523px] md:h-[1053px] w-full overflow-hidden bg-[#E1E1E1]">
        {/* Background image centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[1099px] h-[1053px] opacity-[0.15] mix-blend-luminosity">
            <Image
              src={imgCTA}
              alt="Background"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="relative max-w-[1440px] mx-auto px-[16px] md:px-[40px] h-full flex flex-col items-center justify-center">
          <p className="font-['DM_Sans'] font-light text-[45px] md:text-[128px] leading-[45px] md:leading-[0.95] tracking-[-1.8px] md:tracking-[-6.4px] text-[#161616] text-center max-w-[358px] md:max-w-[861px] mb-[32px] md:mb-[80px]">
            Ready to <span className="font-['Tiro_Tamil'] italic">build</span> with fire?
          </p>
          <div className="flex flex-col md:flex-row gap-[16px] items-center">
            <Link
              href="/kontaktai"
              className="bg-[#161616] rounded-[100px] px-[40px] py-[10px] h-[48px] flex items-center justify-center"
            >
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
                get an offer
              </p>
            </Link>
            <Link
              href="/kontaktai"
              className="border border-[#161616] rounded-[100px] px-[40px] py-[10px] h-[48px] flex items-center justify-center"
            >
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
                get in touch
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
