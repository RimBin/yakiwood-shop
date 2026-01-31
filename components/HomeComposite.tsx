// Full Figma design snapshot (node 790:6589). Absolute positioning retained for pixel-perfect baseline.
// Assets expire ~7 days. Future step: refactor to flow layout once verified.
import React from 'react';
import Image from 'next/image';
import { assets } from '@/lib/assets';

// Asset constants (subset – extend if more needed during refinement)
const img = "https://www.figma.com/api/mcp/asset/03940b92-c1db-419a-9e1e-cc8ac1144d96";
const img1 = "https://www.figma.com/api/mcp/asset/fe73766a-cbcd-4084-ba9e-f7ba4004d5d7";
const img2 = "https://www.figma.com/api/mcp/asset/e9c985b7-e63f-4602-8bb8-e405000368b4";
const img3 = "https://www.figma.com/api/mcp/asset/731bdf5e-9077-4da7-924b-a049641b0a86";
const imgVector13 = "https://www.figma.com/api/mcp/asset/4e132319-5069-409e-9ec6-1bf5fca19cd4";
const imgVector17 = "https://www.figma.com/api/mcp/asset/8b41b41f-510c-44cd-ba73-ba7a3add1ae8";
const imgMaskGroup = "https://www.figma.com/api/mcp/asset/92dd7b16-1f6f-44f2-9b8c-af9f353810a7";
const imgMastercard2019Logo1 = "https://www.figma.com/api/mcp/asset/bc1c853d-a3f8-4fde-969b-c3238bf7fbef";
const imgVisa20211 = "https://www.figma.com/api/mcp/asset/792d2cda-7ed3-4763-9224-099500ca8e87";
const imgVector37 = "https://www.figma.com/api/mcp/asset/9274c2a2-4bc5-4e51-9308-14e42d982f19";
const img4 = "https://www.figma.com/api/mcp/asset/3d3115ed-fa65-4f34-9555-7cb74d0bf16a";
const img5 = "https://www.figma.com/api/mcp/asset/0ffe9c7c-a6bb-4839-8c58-c3646ca75eec";
const img6 = "https://www.figma.com/api/mcp/asset/74a2d8ff-28f4-4f99-8efe-4483a3758e42";
const img7 = "https://www.figma.com/api/mcp/asset/f10969e1-6f80-4fc2-806a-588d74c5d97c";
const img8 = "https://www.figma.com/api/mcp/asset/0239bb25-010b-4157-a991-b384962b9662";
const img9 = "https://www.figma.com/api/mcp/asset/a4f3a406-5302-42f3-ac20-20f6ab3aff86";
const img10 = "https://www.figma.com/api/mcp/asset/ffe20076-b089-4f46-8106-b693b5876718";
const img11 = "https://www.figma.com/api/mcp/asset/5acf0f7b-fe31-4cad-a749-546ab1d7dfce";
const img24 = "https://www.figma.com/api/mcp/asset/d19c89ef-0b58-4b67-8517-2b8a47ae732a";
const img25 = "https://www.figma.com/api/mcp/asset/07b246cb-e992-4560-86ae-5a2ba00ea3b1";
const img26 = "https://www.figma.com/api/mcp/asset/1cee288c-e3d5-408e-b69a-b524c232e795";
const img27 = "https://www.figma.com/api/mcp/asset/428056bd-aa55-41e3-8c75-f6eb1c51a6be";
const img28 = "https://www.figma.com/api/mcp/asset/5b8615f8-d794-4f34-8807-ce52e7368a47";
const img29 = "https://www.figma.com/api/mcp/asset/d32c79ba-dbb5-40c1-9a82-2c23864e2ded";
const img30 = "https://www.figma.com/api/mcp/asset/c1442670-5b39-4633-ae96-5707498c5348";
const img31 = "https://www.figma.com/api/mcp/asset/b6780f55-ae4f-4a04-9ac4-e20a73c7795f";
const img32 = "https://www.figma.com/api/mcp/asset/97f33bbf-39a7-435c-90b0-6324b4578a28";
const img33 = "https://www.figma.com/api/mcp/asset/78003404-2887-427c-965c-23e0eee500e3";
const img34 = "https://www.figma.com/api/mcp/asset/e56aace6-a187-4972-b85b-1da8d7b89570";
const img35 = "https://www.figma.com/api/mcp/asset/b1f2aa5b-06c5-43a0-9fac-b9b2d957832e";
const img36 = "https://www.figma.com/api/mcp/asset/d79e2d10-4061-40f8-bd11-37ae76b18781";
const img51 = "https://www.figma.com/api/mcp/asset/ed09f340-9efc-41d9-b58e-2767b785ac55";
const img52 = "https://www.figma.com/api/mcp/asset/8a9f7b67-59b8-45bc-835f-00a647ebfdc4";
const img53 = "https://www.figma.com/api/mcp/asset/480e3b2c-f311-44d7-96d2-37322f8e479b";
const img54 = "https://www.figma.com/api/mcp/asset/c41417a8-2360-4ec5-8d4f-56d2a7372738";
const img55 = "https://www.figma.com/api/mcp/asset/99bf8ca0-402c-450c-ba90-52a54ce0bb6d";
const img56 = "https://www.figma.com/api/mcp/asset/cfb42a3e-e4fe-4d10-a942-00ec56528440";
const img57 = "https://www.figma.com/api/mcp/asset/f6ec43bb-f2ef-4f7e-95cb-fdcc38f01103";
const img58 = "https://www.figma.com/api/mcp/asset/678270f8-d7e2-4d53-a921-3f1d785a9429";
const img59 = "https://www.figma.com/api/mcp/asset/157fbc6a-582a-4a65-82e1-9e6eae6dc6c4";
const img60 = "https://www.figma.com/api/mcp/asset/18aa0040-ac18-4624-b719-023795b827ca";
const img61 = "https://www.figma.com/api/mcp/asset/b3112cff-b43f-4cb8-ae10-59f143376b6a";
const img62 = "https://www.figma.com/api/mcp/asset/dd88d422-3834-420c-b67b-2c8460942c7c";
const img63 = "https://www.figma.com/api/mcp/asset/f69f7e2f-4158-42bf-a7c8-a635bdf391c4";

export default function HomeComposite() {
  return (
    <div className="bg-[#e1e1e1] relative w-[1440px] h-[11712px] mx-auto" data-name="1440px/Homepage" data-node-id="790:6589">
      {/* Announcement bar */}
      <div className="absolute bg-[#161616] box-border flex gap-[200px] items-center justify-center left-1/2 px-[40px] py-[8px] top-0 translate-x-[-50%] w-[1440px]" data-name="Announcement bar">
        <div className="flex gap-[8px] items-center">
          <div className="relative size-[24px] overflow-clip">
            <img alt="" src={img26} className="opacity-0" />
          </div>
          <p className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">Fast delivery</p>
        </div>
        <div className="flex gap-[8px] items-center">
          <p className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">money back garantee</p>
        </div>
        <div className="flex gap-[8px] items-center">
          <p className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">eco-friendly</p>
        </div>
      </div>

      {/* Header */}
      <div className="absolute border-b border-[#bbbbbb] flex items-center justify-between left-1/2 px-[40px] py-[16px] top-[24px] translate-x-[-50%] w-[1440px]" data-name="Header">
        <div className="h-[48px] w-[126px]">
          <img alt="Logo" src={img61} className="h-[48px] w-[126px]" />
        </div>
        <nav className="flex gap-[40px] items-center">
          {['Shop','Purpose','Projects','About us','Contacts'].map(item => (
            <span key={item} className="font-['Outfit:Regular',sans-serif] text-[#161616] text-[12px] tracking-[0.6px] uppercase">{item}</span>
          ))}
        </nav>
        <div className="border border-[#535353] rounded-[100px] h-[48px] px-[24px] flex items-center gap-[8px]">
          <span className="font-['Outfit:Regular',sans-serif] text-[#161616] text-[12px] tracking-[0.6px] uppercase">cart</span>
        </div>
      </div>

      {/* Hero */}
      <div className="absolute left-0 top-[24px] w-[1440px] h-[776px]" data-name="Hero">
        <div className="absolute inset-0 bg-[#eaeaea]" />
        <img alt="Hero mask" src={imgMaskGroup} className="absolute inset-0 size-full" />
        <div className="absolute left-[40px] top-[259px] flex flex-col gap-[24px] w-[606px]">
          <p className="font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px] leading-none text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>Timeless beauty, enhanced by fire - <span className="font-['Tiro_Tamil:Italic',sans-serif] italic tracking-[-1.6px]">Yakiwood</span></p>
          <p className="font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#161616] w-[323px]">Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique. </p>
          <div className="border border-[#161616] rounded-[100px] h-[48px] flex items-center justify-center px-[40px]">
            <span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">Explore catalog</span>
          </div>
          <div className="flex gap-[24px]">
            <img alt="Mastercard" src={imgMastercard2019Logo1} className="h-[21.856px] w-[35.366px]" />
            <img alt="Visa" src={imgVisa20211} className="h-[11.483px] w-[35.366px]" />
          </div>
        </div>
        {/* Certificates row */}
        <div className="absolute left-1/2 top-[800px] translate-x-[-50%] w-[1440px] flex gap-[150px] justify-center items-center px-[40px] py-[16px] bg-[#161616]">
          <img alt="cert1" src={img24} className="h-[53px] w-[46px]" />
          <img alt="cert2" src={img25} className="h-[24px] w-[81px]" />
          <img alt="cert3" src={img26} className="h-[47px] w-[35px]" />
          <img alt="cert4" src={img27} className="h-[41px] w-[80px]" />
          <img alt="cert5" src={img28} className="h-[48px] w-[53px]" />
          <img alt="cert6" src={img29} className="h-[27px] w-[38px]" />
        </div>
      </div>

      {/* Why Us */}
      <div className="absolute left-[40px] top-[1085px] w-[1360px]" data-name="Why us">
        <p className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616] absolute left-[40px] top-[18px]">yakiwood</p>
        <p className="font-['DM_Sans:Light',sans-serif] text-[52px] tracking-[-2.08px] leading-none text-[#161616] whitespace-pre-wrap">We are experts in the preparation of <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">burnt wood</span>, with many years of <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">successful</span> experience in preparing wood for facades, terraces, fences and interiors, and we guarantee a <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">high quality</span> and long-lasting <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">result</span>.</p>
        <div className="absolute left-[40px] top-[432px] flex gap-[16px]">
          {[
            {title:'Beautiful natural aesthetics',text:'Fire-treated for superior resistance to moisture, pests, and decay.', icon: assets.icons.fire},
            {title:'Striking Look',text:'Deep texture and rich tones enhance any design.', icon: assets.icons.warehouse},
            {title:'Eco-friendly',text:'Sustainably sourced with no harmful chemicals.', icon: assets.icons.plantSvg},
            {title:'Versatile for any project',text:'Perfect for cladding, decking, and interiors.', icon: assets.icons.cube},
          ].map((b,i)=> (
            <div key={b.title} className="bg-[#eaeaea] rounded-[8px] p-[16px] w-[328px] flex flex-col gap-[24px] min-h-[220px]">
              <div className="rounded-[100px] border border-[#bbbbbb] h-[48px] w-[48px] flex items-center justify-center">
                <Image src={b.icon} alt={b.title} width={24} height={24} />
              </div>
              <div className="flex flex-col gap-[8px]">
                <p className="font-['DM_Sans:Medium',sans-serif] text-[18px] tracking-[-0.36px] text-[#161616]" style={{ fontVariationSettings: "'opsz' 14" }}>{b.title}</p>
                <p className="font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#535353] w-[257px]">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="absolute left-[calc(50%+8px)] top-[256px] font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#535353] w-[312px]">Our aim is to help you create a cosy and sustainable environment using a natural, time-tested woodworking method...</p>
      </div>

      {/* Products Section */}
      <div className="absolute left-[30px] top-[1885px]" data-name="Products">
        <p className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616] absolute left-[30px] top-[23px]">products</p>
        <p className="font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px] text-[#161616] absolute left-[calc(25%+14px)] top-0">Choose your <span className="font-['Tiro_Tamil:Italic',sans-serif] italic tracking-[-2.4px]">perfect</span> wood finish</p>
        <div className="absolute left-[calc(50%+0.5px)] top-[218px] -translate-x-1/2 flex gap-[16px]" data-name="Cards">
          {[img25,img35,img36].map((imgSrc, idx) => (
            <div key={idx} className="bg-[#eaeaea] rounded-[8px] flex flex-col gap-[24px] pt-[24px] pb-[40px] px-[24px] w-[443px]">
              <div className="h-[311px] w-[395px] bg-[#eaeaea] overflow-hidden">
                <img alt="product" src={imgSrc} className="object-cover w-full h-full" />
              </div>
              <div className="flex flex-col gap-[16px] w-[383px]">
                <div className="flex gap-[8px] text-[10px] tracking-[0.5px] uppercase font-['Outfit:Regular',sans-serif] text-[#161616]">
                  {['Facades','Fence','Terrace','Interior'].map(t=> <span key={t} className="bg-white/40 rounded-[4px] h-[24px] flex items-center px-[8px]">{t}</span>)}
                </div>
                <div className="flex flex-col gap-[8px]">
                  <div className="flex justify-between font-['DM_Sans:Regular',sans-serif] text-[32px] tracking-[-1.28px] text-[#161616]"><span>{idx===0?'Spruce wood':'Larch wood'}</span><span>89 €</span></div>
                  <p className="font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#535353]">Lightweight yet strong, spruce wood offers a smooth texture and a natural, clean finish...</p>
                </div>
                <div className="flex gap-[8px] items-center flex-wrap">
                  {[img26,img27,img29,img30,img31,img32,img33,img34].map(c=> <img key={c} alt="color" src={c} className="h-[32px] w-[32px] rounded" />)}
                </div>
              </div>
              <div className="bg-white rounded-[100px] h-[48px] flex items-center justify-center px-[40px]"><span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">Buy now</span></div>
            </div>
          ))}
        </div>
        <div className="absolute left-1/2 top-[906px] -translate-x-1/2 w-[296px] h-[48px] bg-[#161616] rounded-[100px] flex items-center justify-center">
          <span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">view catalog</span>
        </div>
      </div>

      {/* Solutions */}
      <div className="absolute left-0 top-[3039px] w-[1440px]" data-name="Solution">
        <p className="absolute left-[39px] top-[25px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">purpose</p>
        <p className="absolute left-[calc(25%+24.75px)] top-0 font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px]">Versatile <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">solutions</span> for every project</p>
        <div className="absolute left-0 top-[225px] flex flex-col w-full">
          <div className="flex bg-[#e1e1e1] px-[40px] py-[24px] gap-[16px] items-start">
            <p className="font-['DM_Sans:Regular',sans-serif] text-[32px] tracking-[-1.28px] w-[328px]">Fence</p>
            <div className="h-[100px] w-[672px] bg-[#ccc] rounded-t-[8px]" />
          </div>
          <div className="flex bg-[#161616] px-[40px] py-[24px] gap-[16px] items-start">
            <p className="font-['DM_Sans:Regular',sans-serif] text-[32px] tracking-[-1.28px] w-[328px] text-white">Facades</p>
            <div className="h-[300px] w-[672px] rounded-[8px] overflow-hidden"><img alt="facade" src={img58} className="h-full w-full object-cover" /></div>
            <div className="flex flex-col justify-between h-[300px] w-[288px] text-white">
              <p className="font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px]">Burnt wood is an ancient and unique technique ...</p>
              <button className="flex items-center gap-[8px] h-[24px] text-[12px] tracking-[0.6px] uppercase">Learn more <img alt="arrow" src={img59} className="h-[16px]" /></button>
            </div>
          </div>
          <div className="flex bg-[#e1e1e1] px-[40px] py-[24px] gap-[16px] items-start">
            <p className="font-['DM_Sans:Regular',sans-serif] text-[32px] tracking-[-1.28px] w-[328px]">Terace</p>
            <div className="h-[100px] w-[672px] bg-[#ccc] rounded-t-[8px]" />
          </div>
          <div className="flex bg-[#e1e1e1] px-[40px] py-[24px] gap-[16px] items-start">
            <p className="font-['DM_Sans:Regular',sans-serif] text-[32px] tracking-[-1.28px] w-[328px]">Interior</p>
            <div className="h-[100px] w-[672px] bg-[#ccc] rounded-t-[8px]" />
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="absolute left-[40px] top-[4262px] w-[1440px]" data-name="Projects">
        <p className="absolute left-[40px] top-[22px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">Projects</p>
        <p className="absolute left-[calc(25%+25px)] top-0 font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px]">Inspiring <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">projects</span></p>
        <div className="absolute left-[40px] top-[144px] flex flex-wrap gap-[24px] w-[1360px]">
          {[img51,img52,img53,img54,img55,img56].map((p,i)=> (
            <div key={i} className="rounded-[8px] overflow-hidden bg-[#eaeaea]" style={{width: i<2?508: (i%3===2?328:328), height: i<2?520:330}}>
              <img alt="project" src={p} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <button className="absolute left-[calc(75%+164px)] top-[28px] h-[24px] text-[12px] tracking-[0.6px] uppercase flex items-center">View all projects <img alt="arrow" src={img11} className="h-[16px]" /></button>
      </div>

      {/* Steps */}
      <div className="absolute left-1/2 top-[5780px] translate-x-[-50%] w-[1440px]" data-name="Steps">
        <div className="absolute left-0 top-[5780px] w-[1440px] h-[752px] bg-[#161616]" />
        <p className="absolute left-[40px] top-[5925px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">Process</p>
        <p className="absolute left-[calc(25%+24px)] top-[5900px] font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px] text-white">Simple & fast <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">ordering</span> process</p>
        {["Customize Your Order","Add to Cart & Checkout","Select Delivery","Receive Your Order"].map((t,i)=> (
          <div key={t} className="absolute" style={{left: i===0?40: i===1? 'calc(25%+73px)': i===2? 'calc(50%+124px)': 'calc(75%+132px)', top:6125}}>
            <div className="border border-[#535353] rounded-[100px] h-[48px] w-[48px] flex items-center justify-center text-white font-['DM_Sans:Medium',sans-serif] text-[14px] tracking-[0.42px]">{i+1}</div>
            <p className="mt-[16px] font-['DM_Sans:Medium',sans-serif] text-[18px] tracking-[-0.36px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>{t}</p>
          </div>
        ))}
        <div className="absolute left-1/2 top-[6364px] -translate-x-1/2 w-[1360px] h-[48px] bg-white rounded-[100px] flex items-center justify-center"><span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">make order</span></div>
      </div>

      {/* Testimonials (static triple) */}
      <div className="absolute left-1/2 top-[6732px] translate-x-[-50%] w-[1440px]" data-name="Testimonials">
        <p className="absolute left-[40px] top-[25px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">testimonials</p>
        <p className="absolute left-[calc(25%+25px)] top-0 font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px] text-[#161616]">What our <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">clients</span> say</p>
        <div className="absolute left-1/2 top-[144px] -translate-x-1/2 flex gap-[16px] w-[1440px] justify-center">
          {[img4,img5,img4].map((bg,i)=> (
            <div key={i} className={`rounded-${i===1?'[8px]':'[16px]'} p-[32px] h-[451px] w-[673px] flex flex-col justify-between ${i===1?'bg-[#161616]':'border border-[#bbbbbb] opacity-30'} relative`}>
              <img alt="review-bg" src={bg} className="absolute inset-0 w-full h-full object-cover rounded-inherit" />
              <p className={`font-['DM_Sans:Medium',sans-serif] text-[18px] tracking-[-0.18px] leading-[1.55] ${i===1?'text-white':'text-[#161616]'}`}>“Sample testimonial content for pixel-perfect layout.”</p>
              <p className={`font-['DM_Sans:Medium',sans-serif] text-[14px] tracking-[-0.14px] ${i===1?'text-white':'text-[#161616]'}`}>— Mindaugas P., Architect</p>
            </div>
          ))}
        </div>
      </div>

      {/* About & Partners */}
      <div className="absolute left-0 top-[7527px] w-[1440px]" data-name="About">
        <p className="absolute left-[40px] top-[26px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">about us</p>
        <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px]">Our story: crafting <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">quality</span> with <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">passion</span></p>
        <div className="absolute left-[40px] top-[224px] w-[1360px] flex">
          <img alt="about-img" src={img24} className="h-[175px] w-[175px] rounded-[8px]" />
          <img alt="video" src={img25} className="h-[623px] w-[672px] rounded-[8px] ml-[calc(25%+24px)]" />
          <div className="ml-[40px] w-[308px] flex flex-col gap-[40px]">
            <p className="font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#535353]">We honor the ancient Japanese art of Shou Sugi Ban...</p>
            <button className="h-[24px] text-[12px] tracking-[0.6px] uppercase flex items-center gap-[8px]">Read about us <img alt="arrow" src={img11} className="h-[16px]" /></button>
          </div>
        </div>
        <p className="absolute left-[calc(25%+24px)] top-[911px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">Our partners</p>
        <div className="absolute left-0 top-[947px] w-[1440px] flex gap-[16px] justify-center">
          {[img26,img27,img28,img29,img30,img31,img32].map(p => (
            <div key={p} className="bg-[#eaeaea] rounded-[8px] h-[210px] w-[213px] flex items-center justify-center">
              <img alt="partner" src={p} className="max-h-[60px]" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="absolute left-0 top-[8885px] w-[1440px]" data-name="FAQ">
        <p className="absolute left-[40px] top-[25px] font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">faq</p>
        <p className="absolute left-[calc(25%+24px)] top-0 font-['DM_Sans:Light',sans-serif] text-[80px] tracking-[-4.4px] text-[#161616]">Everything you wanted <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">to ask</span> & more</p>
        <div className="absolute left-0 top-[225px] flex flex-col w-[1440px]">
          {[1,2,3,4,5,6].map(q => (
            <div key={q} className={`px-[40px] py-[24px] flex justify-between items-start ${q===1? 'bg-[#161616] text-white h-[173px]':'bg-[#e1e1e1] text-[#161616]'} w-full`}> 
              <div className="flex gap-[16px] font-['DM_Sans:Medium',sans-serif] text-[18px] tracking-[-0.36px]" style={{ fontVariationSettings: "'opsz' 14" }}>
                <span className={`text-[14px] tracking-[0.42px] uppercase w-[80px] ${q===1?'text-[#bbbbbb]':'text-[#535353]'}`}>{String(q).padStart(2,'0')}</span>
                <span>{`Question ${q}`}</span>
              </div>
              <div className="h-[20px] w-[20px]" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="absolute left-1/2 top-[9903px] translate-x-[-50%] w-[1440px]" data-name="CTA">        {/* Background image (shared with Solutions CTA) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[625px] lg:w-[1099px] h-[599px] lg:h-[1053px] opacity-15 mix-blend-luminosity pointer-events-none">
          <Image src={assets.ctaBackground} alt="" fill className="object-contain" />
        </div>        <p className="absolute left-1/2 top-[113px] -translate-x-1/2 font-['DM_Sans:Light',sans-serif] text-[128px] leading-[0.95] tracking-[-6.4px] text-center text-[#161616]">Ready to <span className="font-['Tiro_Tamil:Italic',sans-serif] italic">build</span> with fire?</p>
        <div className="absolute left-1/2 top-[423px] -translate-x-1/2 flex gap-[16px]">
          <div className="border border-[#161616] rounded-[100px] h-[48px] px-[40px] flex items-center"><span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-[#161616]">get in touch</span></div>
          <div className="bg-[#161616] rounded-[100px] h-[48px] px-[40px] flex items-center"><span className="font-['Outfit:Regular',sans-serif] text-[12px] tracking-[0.6px] uppercase text-white">Choose wood</span></div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute left-1/2 top-[11106px] translate-x-[-50%] w-[1440px] h-[606px] bg-[#161616] text-[#e1e1e1]" data-name="Footer">
        <div className="absolute left-[40px] top-[220px] flex gap-[120px]">
          <div>
            <p className="font-['DM_Sans:Regular',sans-serif] text-[24px] tracking-[-0.96px]">Client care</p>
            <div className="mt-[24px] flex flex-col gap-[8px] font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#bbbbbb]">
              <span>FAQs</span><span>Policies</span><span>Cookie policy</span>
            </div>
          </div>
          <div>
            <p className="font-['DM_Sans:Regular',sans-serif] text-[24px] tracking-[-0.96px]">Information</p>
            <div className="mt-[16px] flex flex-col gap-[8px] font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#bbbbbb]">
              <span>About us</span><span>Contacts</span><span>Projects</span>
            </div>
          </div>
          <div>
            <p className="font-['DM_Sans:Regular',sans-serif] text-[24px] tracking-[-0.96px]">Social</p>
            <div className="mt-[24px] flex flex-col gap-[8px] font-['Outfit:Light',sans-serif] text-[14px] tracking-[0.14px] text-[#bbbbbb]">
              <span>Facebook</span><span>Instagram</span><span>LinkedIn</span>
            </div>
          </div>
        </div>
        <p className="absolute left-[40px] top-[230px] font-['DM_Sans:Medium',sans-serif] text-[16px] tracking-[-0.64px]">@2025 YAKIWOOD, LLC.  All rights reserved</p>
      </div>
    </div>
  );
}
