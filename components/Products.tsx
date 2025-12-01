import React from 'react';
import Image from 'next/image';

// Exact Figma assets from Product node 803:11944 - UPDATED
const imgMask = "https://www.figma.com/api/mcp/asset/eaf3a351-7257-46f3-9a78-0b1093c989a1";

// Product images
const imgSpruce = "https://www.figma.com/api/mcp/asset/e3f260c3-81ff-46b3-ace3-bfa23d0e3a3d";
const imgLarch1 = "https://www.figma.com/api/mcp/asset/dc0c2a25-b620-43f9-8c39-c9794ce77229";
const imgLarch2 = "https://www.figma.com/api/mcp/asset/bfc9b479-b9b7-4f7e-aa0c-d10d7fa676b9";

// Color swatches
const imgColor1 = "https://www.figma.com/api/mcp/asset/a298ba5d-f933-41be-a2ea-5be1b62db8f9";
const imgColor2 = "https://www.figma.com/api/mcp/asset/46e65c51-e433-426a-82c5-a0cf68f1fa8d";
const imgColor3 = "https://www.figma.com/api/mcp/asset/24716f27-b792-4b62-9c79-8984510d7535";
const imgColor4 = "https://www.figma.com/api/mcp/asset/cbaa66d6-b9e2-4ee8-8179-459e2b69422b";
const imgColor5 = "https://www.figma.com/api/mcp/asset/8d766674-e42c-483c-a5ed-3263b8d0d611";
const imgColor6 = "https://www.figma.com/api/mcp/asset/1ac8b06b-7c06-457d-9710-f428601ce18e";
const imgColor7 = "https://www.figma.com/api/mcp/asset/f0ca6bed-b017-4380-bf11-8a6ddbe4b150";
const imgColor8 = "https://www.figma.com/api/mcp/asset/5222c26a-6f24-43f7-8427-0e340b2327c4";

// Product Card - exact Figma layout from node 803:11944
type ProductCardProps = {
  image: string;
  title: string;
  price: string;
  description: string;
  solutions: string[];
};

function ProductCard({ image, title, price, description, solutions }: ProductCardProps) {
  return (
    <div className="bg-[#eaeaea] rounded-[8px] pt-[24px] pb-[40px] px-[24px] w-[443px] flex flex-col gap-[24px] items-center relative shrink-0">
      {/* Background mask overlay */}
      <div className="absolute left-0 top-0 w-[443px] h-[618px] pointer-events-none">
        <Image src={imgMask} alt="" fill className="object-cover" />
      </div>
      
      {/* Product image - 395x311px */}
      <div className="relative w-[395px] h-[311px] shrink-0 z-10">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover"
        />
      </div>
      
      {/* Content container - 383px width */}
      <div className="w-[383px] flex flex-col gap-[16px] relative z-10">
        {/* Solution chips */}
        <div className="flex gap-[8px] items-center justify-center flex-wrap">
          {solutions.map((sol, idx) => (
            <div 
              key={idx}
              className="bg-white/40 px-[8px] py-[10px] h-[24px] rounded-[4px] flex items-center justify-center gap-[10px]"
            >
              <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] tracking-[0.5px] uppercase text-[#161616]">
                {sol}
              </p>
            </div>
          ))}
        </div>
        
        {/* Title & Price - exact spacing */}
        <div className="flex items-start justify-between w-full leading-[1.1] font-['DM_Sans'] font-normal text-[32px] tracking-[-1.28px] text-[#161616]">
          <p className="shrink-0">
            {title}
          </p>
          <p className="shrink-0">
            {price}
          </p>
        </div>
        
        {/* Description - 354px width */}
        <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#535353] w-[354px] whitespace-pre-wrap">
          {description}
        </p>
        
        {/* Colors section */}
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">
            Colors
          </p>
          <div className="flex gap-[8px] items-center overflow-clip">
            {[imgColor1, imgColor2, imgColor4, imgColor5, imgColor6, imgColor7, imgColor8].map((src, idx) => (
              <div 
                key={idx} 
                className="flex flex-col gap-[4px] items-center justify-center rounded-[4px] w-[32px] h-[32px] relative"
              >
                <Image src={src} alt="" width={32} height={32} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const products = [
    {
      image: imgSpruce,
      title: 'Spruce wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      solutions: ['Facades', 'Fence', 'Terrace', 'Interior']
    },
    {
      image: imgLarch1,
      title: 'Larch wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      solutions: ['Facades', 'Fence', 'Terrace', 'Interior']
    },
    {
      image: imgLarch2,
      title: 'Larch wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      solutions: ['Facades', 'Fence', 'Interior']
    }
  ];

  return (
    <section className="w-full bg-[var(--Background-Grey,#E1E1E1)]">
      <div className="max-w-[1440px] mx-auto px-[40px] py-[120px] flex flex-col gap-[56px] items-center">
        <div className="flex flex-col gap-[16px] items-start lg:items-center">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] whitespace-nowrap">
            products
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] text-[#161616] text-left lg:text-center max-w-[860px]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">perfect</span>
            <span> wood finish</span>
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-[16px]">
          {products.map((product, idx) => (
            <ProductCard key={idx} {...product} />
          ))}
        </div>

        <button className="bg-[#161616] px-[40px] py-[10px] h-[48px] rounded-[100px] w-[296px] flex items-center justify-center gap-[10px]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-white">
            view catalog
          </p>
        </button>
      </div>
    </section>
  );
}
