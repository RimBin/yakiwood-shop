import React from 'react';

// Image assets from Figma
const imgImg = "https://www.figma.com/api/mcp/asset/443ef684-6480-4295-89ab-6409d57c08ab";
const imgImg1 = "https://www.figma.com/api/mcp/asset/7dbdb917-3eea-46b9-b1e8-7d0625897aff";
const imgImg2 = "https://www.figma.com/api/mcp/asset/7cb75ec3-5d5a-4fc3-9056-d7886dfd31bc";
const imgImg3 = "https://www.figma.com/api/mcp/asset/767dc088-1395-4f43-9a12-d29b1cadc52b";
const imgImg4 = "https://www.figma.com/api/mcp/asset/2ccfab61-ec6f-4af5-a62b-66bdfd4ec8b3";
const imgImg6 = "https://www.figma.com/api/mcp/asset/9d8fe14c-f6e3-401b-9793-db353ec65c08";
const imgEllipse11 = "https://www.figma.com/api/mcp/asset/e5893a54-a995-4a13-8e24-c52849d7e2ef";
const imgBlackLarchShouSugiBanWoodenPlankForFacade = "https://www.figma.com/api/mcp/asset/20b1c9cd-cf9d-4fe7-b8dc-ef9ac765c26a";
const imgCarbonLarchShouSugiBanWoodenPlankForFacade = "https://www.figma.com/api/mcp/asset/78b836c0-7755-4329-b38d-5c93d5834843";
const imgImg5 = "https://www.figma.com/api/mcp/asset/44398661-95d6-48be-a320-4acd62d7af9c";
const imgMaskGroup = "https://www.figma.com/api/mcp/asset/4b106df2-bac7-4c4e-bd78-fc746ad2ecd6";
const imgMastercard2019Logo1 = "https://www.figma.com/api/mcp/asset/9d2e1a5e-3171-4551-946a-29ed6b9cf86b";
const imgVisa20211 = "https://www.figma.com/api/mcp/asset/fd1151ba-190e-4a0a-98c3-751037b21045";
const imgStripeWordmarkBlurple1 = "https://www.figma.com/api/mcp/asset/b649a04f-e43c-4782-8b81-37a957ef9e6b";

export default function Hero() {
  return (
    <section className="relative w-full h-[861px] overflow-hidden">
      {/* Background with color #eaeaea */}
      <div className="absolute bg-[#eaeaea] h-[776px] left-0 top-[24px] w-full" />
      
      {/* Background mask image */}
      <div className="absolute h-[776px] left-0 top-[24px] w-full">
        <img alt="" className="block max-w-none size-full" src={imgMaskGroup} />
      </div>

      {/* Main content container - max-width 1440px centered */}
      <div className="relative h-full max-w-[1440px] mx-auto">
        {/* Left Text Content - absolute positioned */}
        <div className="absolute left-[40px] top-[259px] flex flex-col gap-[24px] items-start">
          <p className="font-['DM_Sans'] font-light text-[80px] leading-none text-[#161616] tracking-[-4.4px] w-[606px] whitespace-pre-wrap">
            <span>Timeless beauty, enhanced by fire - </span>
            <span className="font-['Tiro_Tamil'] italic tracking-[-1.6px]">Yakiwood</span>
          </p>
          
          <div className="flex flex-col gap-[24px] items-start overflow-clip">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] text-[#161616] tracking-[0.14px] w-[323px] whitespace-pre-wrap">
              Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.
            </p>
            
            <div className="border border-[#161616] border-solid box-border flex gap-[10px] h-[48px] items-center justify-center px-[40px] py-[10px] rounded-[100px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#161616] tracking-[0.6px] uppercase">
                Explore catalog
              </p>
            </div>
            
            {/* Payment Methods - with exact opacity 30% */}
            <div className="flex gap-[24.39px] items-center opacity-30">
              <div className="h-[21.856px] w-[35.366px]">
                <img alt="" className="block max-w-none size-full" src={imgMastercard2019Logo1} />
              </div>
              <div className="h-[11.483px] w-[35.366px]">
                <img alt="" className="block max-w-none size-full" src={imgVisa20211} />
              </div>
              <div className="h-[25px] w-[40.1px]">
                {/* Maestro logo would go here - complex SVG */}
                <div className="bg-[#7C7C7C] rounded h-full w-full" />
              </div>
              <div className="h-[25px] w-[53px]">
                <img alt="" className="block max-w-none size-full" src={imgStripeWordmarkBlurple1} />
              </div>
              <div className="h-[13.864px] w-[56.594px]">
                {/* PayPal logo would go here - complex SVG */}
                <div className="bg-[#7C7C7C] rounded h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Product Image + Card - absolute positioned */}
        <div className="absolute left-[calc(50%+10px)] top-[125px]">
          {/* Product Image with rotation */}
          <div className="bg-[#bbab92] h-[654px] rounded-[24px] w-[670px]" />
          <div className="absolute flex items-center justify-center left-[2px] top-[42.86px] h-[610px] w-[666px]">
            <div className="flex-none rotate-[333.068deg]">
              <div className="h-[335.073px] relative w-[573.487px] overflow-hidden">
                <img alt="" className="absolute h-full left-0 max-w-none top-0 w-[104.18%]" src={imgImg6} />
              </div>
            </div>
          </div>

          {/* Floating Product Card - absolute positioned */}
          <div className="absolute backdrop-blur-[20px] bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.5)] border-solid box-border flex flex-col gap-[16px] items-start left-[311px] p-[16px] rounded-[24px] top-[352px] w-[351px]">
            <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] text-white tracking-[-0.96px] w-[292px] whitespace-pre-wrap">
              Shou sugi Ban Planks
            </p>
            
            <div className="flex gap-[8px] items-center text-white">
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px]">
                From
              </p>
              <p className="font-['DM_Sans'] font-normal text-[24px] leading-[1.1] tracking-[-0.96px]">
                89 €
              </p>
            </div>
            
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-white tracking-[-0.24px]">
                Solutions
              </p>
              <div className="flex gap-[4px] items-start">
                {['Facades', 'fence', 'terrace', 'interior'].map(tag => (
                  <div key={tag} className="bg-[rgba(255,255,255,0.4)] box-border flex gap-[10px] h-[24px] items-center justify-center px-[8px] py-[10px] rounded-[4px]">
                    <p className="font-['Outfit'] font-normal text-[10px] leading-[1.1] text-[#161616] tracking-[0.5px] uppercase">
                      {tag}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-[8px] items-start">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.1] text-white tracking-[-0.24px] w-full whitespace-pre-wrap">
                Colors
              </p>
              <div className="box-border flex isolate items-start pl-0 pr-[4px] py-0 w-full">
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[6]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgEllipse11} width="33" />
                  </div>
                </div>
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[5]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgBlackLarchShouSugiBanWoodenPlankForFacade} width="33" />
                  </div>
                </div>
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[4]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgCarbonLarchShouSugiBanWoodenPlankForFacade} width="33" />
                  </div>
                </div>
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[3]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgCarbonLarchShouSugiBanWoodenPlankForFacade} width="33" />
                  </div>
                </div>
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[2]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgCarbonLarchShouSugiBanWoodenPlankForFacade} width="33" />
                  </div>
                </div>
                <div className="mr-[-4px] relative shrink-0 size-[32px] z-[1]">
                  <div className="absolute inset-[-1.56%]">
                    <img alt="" className="block max-w-none size-full" height="33" src={imgCarbonLarchShouSugiBanWoodenPlankForFacade} width="33" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white box-border flex gap-[10px] h-[48px] items-center justify-center px-[40px] py-[10px] rounded-[100px] w-full">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#161616] tracking-[0.6px] uppercase">
                Buy now
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Bar at Bottom - absolute positioned */}
      <div className="absolute bg-[#161616] box-border flex gap-[150px] items-center justify-center left-1/2 px-[40px] py-[16px] top-[800px] translate-x-[-50%] w-[1440px] opacity-50">
        <div className="h-[53px] w-[46.872px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImg} />
        </div>
        <div className="h-[24.573px] w-[81.909px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImg1} />
        </div>
        <div className="h-[47.005px] w-[35.013px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImg2} />
        </div>
        <div className="h-[41.528px] w-[80.749px]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img alt="" className="absolute h-[49.37%] left-[-0.78%] max-w-none top-[25.27%] w-[101.56%]" src={imgImg3} />
          </div>
        </div>
        <div className="h-[48.451px] w-[53px]">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImg4} />
        </div>
        <div className="h-[27.418px] w-[38.385px]">
          <img alt="" className="block max-w-none size-full" src={imgImg5} />
        </div>
      </div>
    </section>
  );
}
