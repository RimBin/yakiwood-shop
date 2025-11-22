import React from 'react';

// Figma assets - pixel perfect
const imgEPD = "https://www.figma.com/api/mcp/asset/5f6ba8de-d38a-483a-932c-74bd24f24503";
const imgFSC = "https://www.figma.com/api/mcp/asset/d843cb25-7c61-471a-a6c1-c81978c0fe47";
const imgESParama = "https://www.figma.com/api/mcp/asset/0ade995c-4292-4272-8070-00953fa9afda";
const imgMaskGroup = "https://www.figma.com/api/mcp/asset/5abb99c6-3bde-41b2-9b4a-e959dd8b3dc6";
const imgMastercard = "https://www.figma.com/api/mcp/asset/aa91cea7-c3ab-401e-a487-8ba6e8f9d51a";
const imgVisa = "https://www.figma.com/api/mcp/asset/48acc6f4-3a48-4a52-be80-557864391624";
const imgStripe = "https://www.figma.com/api/mcp/asset/da0ac277-4592-4536-a9b0-84f035146232";
const imgPayPal = "https://www.figma.com/api/mcp/asset/c2e313f2-f379-41b3-801d-ce5738af3978";

export default function Footer() {
  return (
    <footer className="bg-[#161616] text-white relative w-full h-[402px] overflow-hidden">
      {/* Background YAKIWOOD text */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <img src={imgMaskGroup} alt="" className="w-full h-auto" />
      </div>

      <div className="relative w-[1360px] mx-auto h-full px-10">
        {/* Menu sections - using exact Figma positions */}
        <div className="absolute left-10 top-[37px]">
          {/* Information */}
          <div>
            <h4 className="font-['DM_Sans'] text-2xl font-normal mb-4 text-[#e1e1e1] tracking-[-0.96px] leading-[1.1]">
              Information
            </h4>
            <div className="flex flex-col gap-2">
              <a href="#about" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
                About us
              </a>
              <a href="#contact" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
                Contacts
              </a>
              <a href="#projects" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
                Projects
              </a>
            </div>
          </div>
        </div>

        {/* Client care */}
        <div className="absolute left-[380px] top-[37px]">
          <h4 className="font-['DM_Sans'] text-2xl font-normal mb-6 text-[#e1e1e1] tracking-[-0.96px] leading-[1.1]">
            Client care
          </h4>
          <div className="flex flex-col gap-2">
            <a href="#" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
              FAQs
            </a>
            <a href="#" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
              Policies
            </a>
            <a href="#" className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] hover:text-white transition-colors">
              Cookie policy
            </a>
          </div>
        </div>

        {/* Social */}
        <div className="absolute left-[730px] top-[37px]">
          <h4 className="font-['DM_Sans'] text-2xl font-normal mb-6 text-[#e1e1e1] tracking-[-0.96px] leading-[1.1]">
            Social
          </h4>
          <div className="flex flex-col gap-2">
            <p className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] cursor-pointer hover:text-white transition-colors">
              Facebook
            </p>
            <p className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] cursor-pointer hover:text-white transition-colors">
              Instagram
            </p>
            <p className="font-['Outfit'] font-light text-[14px] text-[#bbbbbb] tracking-[0.14px] leading-[1.3] cursor-pointer hover:text-white transition-colors">
              LinkedIn
            </p>
          </div>
        </div>

        {/* Certifications - exact Figma position */}
        <div className="absolute right-10 top-[37px] flex gap-4">
          <div className="bg-[rgba(254,254,254,0.1)] rounded-lg p-2.5 flex items-center justify-center w-[104px] h-[104px]">
            <img src={imgEPD} alt="EPD" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="bg-[rgba(254,254,254,0.1)] rounded-lg p-2.5 flex items-center justify-center w-[104px] h-[104px]">
            <img src={imgFSC} alt="FSC" className="max-w-full max-h-full object-contain" />
          </div>
          <div className="bg-white rounded-lg p-2.5 flex items-center justify-center w-[104px] h-[104px]">
            <img src={imgESParama} alt="ES Parama" className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        {/* Divider line */}
        <div className="absolute left-10 right-10 top-[176px] h-[1px] bg-white opacity-10" />

        {/* Copyright */}
        <p className="absolute left-10 top-[153px] font-['DM_Sans'] font-medium text-base text-[#e1e1e1] tracking-[-0.64px] leading-[1.1]">
          @2025 YAKIWOOD, LLC. All rights reserved
        </p>

        {/* Payment methods - exact Figma position */}
        <div className="absolute left-[1082px] top-[149px] flex items-center gap-[24px]">
          <img src={imgMastercard} alt="Mastercard" className="h-[21.856px] opacity-30" />
          <img src={imgVisa} alt="Visa" className="h-[11.483px] opacity-30" />
          <img src={imgStripe} alt="Stripe" className="h-[25px] opacity-30" />
          <img src={imgPayPal} alt="PayPal" className="h-[13.864px] opacity-30" />
        </div>
      </div>
    </footer>
  );
}
