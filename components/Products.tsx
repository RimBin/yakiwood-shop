import React from 'react';

// Image assets from Figma
const imgImg = "https://www.figma.com/api/mcp/asset/6dc6e61b-d390-4272-a8cd-ad2480977005";
const imgImg1 = "https://www.figma.com/api/mcp/asset/10fb48a7-c82d-4afb-a1cd-9df78b25fc3c";
const imgImg2 = "https://www.figma.com/api/mcp/asset/4ef15750-f914-45e0-bbd8-5123f1a98790";
const img1 = "https://www.figma.com/api/mcp/asset/8859abc7-d1d1-4d0b-b8f9-24bf46799b5c";
const img2 = "https://www.figma.com/api/mcp/asset/7b40a060-187e-4709-b718-e688e8383484";
const img3 = "https://www.figma.com/api/mcp/asset/30a49c1b-1faa-4cb8-8cdc-e49ab77cedcc";
const img = "https://www.figma.com/api/mcp/asset/5180ed7f-63fa-4af4-8112-b4cae13f86e3";

// Color component with states
type ColorProps = {
  className?: string;
  state?: "Default" | "Selected" | "Hover";
  size?: "Big";
};

function Color({ className, state = "Default", size = "Big" }: ColorProps) {
  if (state === "Hover" && size === "Big") {
    return (
      <div className={className}>
        <div className="relative shrink-0 size-[32px]">
          <img alt="" className="block max-w-none size-full" height="32" src={imgImg} width="32" />
        </div>
      </div>
    );
  }
  if (state === "Selected" && size === "Big") {
    return (
      <div className={className}>
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid justify-items-start leading-[0] relative shrink-0">
          <div className="col-[1] ml-[5px] mt-[5px] relative row-[1] size-[32px]">
            <img alt="" className="block max-w-none size-full" height="32" src={imgImg1} width="32" />
          </div>
          <div className="col-[1] ml-0 mt-0 relative row-[1] size-[42px]">
            <img alt="" className="block max-w-none size-full" height="42" src={imgImg2} width="42" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={className}>
      <div className="relative shrink-0 size-[32px]">
        <img alt="" className="block max-w-none size-full" height="32" src={imgImg} width="32" />
      </div>
    </div>
  );
}

// Label component
type LabelProps = {
  className?: string;
  text: string;
};

function Label({ className, text }: LabelProps) {
  return (
    <div className={className}>
      <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] text-[#161616] tracking-[0.5px] uppercase">
        {text}
      </p>
    </div>
  );
}

// Product Card component
type ProductCardProps = {
  image: string;
  title: string;
  price: string;
  description: string;
  labels: string[];
};

function ProductCard({ image, title, price, description, labels }: ProductCardProps) {
  return (
    <div className="bg-[#eaeaea] box-border flex flex-col gap-[24px] items-center pb-[40px] pt-[24px] px-[24px] relative rounded-[8px] shrink-0 w-[443px]">
      {/* Mask group background */}
      <div className="absolute h-[618px] left-0 top-0 w-[443px] pointer-events-none">
        <img alt="" className="block max-w-none size-full" src={img} />
      </div>
      
      {/* Product image */}
      <div className="h-[311px] relative shrink-0 w-[395px] rounded-[8px] overflow-hidden">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={image} />
      </div>
      
      {/* Content container */}
      <div className="flex flex-col gap-[16px] items-start relative shrink-0 w-full">
        {/* Chips */}
        <div className="flex gap-[8px] items-center justify-center">
          {labels.map((label, index) => (
            <Label 
              key={index}
              className="bg-[rgba(255,255,255,0.4)] box-border flex gap-[10px] h-[24px] items-center justify-center px-[8px] py-[10px] relative rounded-[4px] shrink-0"
              text={label}
            />
          ))}
        </div>
        
        {/* Text */}
        <div className="flex flex-col gap-[8px] items-start w-full">
          {/* Title and Price */}
          <div className="flex font-['DM_Sans'] font-normal items-start justify-between leading-[1.1] text-[#161616] text-[32px] tracking-[-1.28px] w-full">
            <p className="relative shrink-0">{title}</p>
            <p className="relative shrink-0">{price}</p>
          </div>
          
          {/* Description */}
          <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] text-[#535353] tracking-[0.14px] w-[354px] whitespace-pre-wrap">
            {description}
          </p>
        </div>
        
        {/* Colors */}
        <div className="flex flex-col gap-[8px] items-start">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-[#161616]">
            Colors
          </p>
          <div className="flex gap-[8px] items-center overflow-clip">
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
            <Color className="flex flex-col gap-[2px] items-center justify-center relative rounded-[4px] shrink-0" state="Selected" />
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
            <Color className="flex flex-col gap-[4px] items-center justify-center opacity-70 relative rounded-[4px] shrink-0 size-[32px]" state="Hover" />
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
            <Color className="flex flex-col gap-[4px] items-center justify-center relative rounded-[4px] shrink-0 size-[32px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const products = [
    {
      image: img1,
      title: 'Spruce wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      labels: ['Facades', 'Facades', 'Terrace', 'Interior']
    },
    {
      image: img2,
      title: 'Larch wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      labels: ['Facades', 'Facades', 'Terrace', 'Interior']
    },
    {
      image: img3,
      title: 'Larch wood',
      price: '89 €',
      description: 'Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish. Its versatility and durability make it an excellent choice for both interior and exterior applications.',
      labels: ['Facades', 'Facades', 'Interior']
    }
  ];

  return (
    <section className="relative w-full bg-white pt-[100px] pb-[100px]">
      <div className="relative w-[1440px] mx-auto">
        {/* Title Section - positioned as in Figma */}
        <div className="relative mb-[100px] text-[#161616]">
          <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase mb-[23px] ml-[30px]">
            products
          </p>
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] max-w-[692px] whitespace-pre-wrap ml-[calc(25%+14px)]">
            <span>Choose your </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-2.4px]">perfect</span>
            <span> wood  finish</span>
          </p>
        </div>

        {/* Product Cards - centered with gap */}
        <div className="flex gap-[16px] items-start justify-center px-[calc((1440px-443px*3-16px*2)/2)]">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>

        {/* View Catalog Button - centered */}
        <div className="flex justify-center mt-[60px]">
          <div className="bg-[#161616] box-border flex gap-[10px] h-[48px] items-center justify-center px-[40px] py-[10px] rounded-[100px] w-[296px]">
            <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-white tracking-[0.6px] uppercase">
              view catalog
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
