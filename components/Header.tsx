import React from 'react';

const imgLogo = "https://www.figma.com/api/mcp/asset/cd064914-cf39-47be-9011-2d30dc73309d";
const imgCart = "https://www.figma.com/api/mcp/asset/b046ac48-ec83-4d95-9b6c-7752ed3fbb4f";

export default function Header() {
  return (
    <header className="border-b border-[#bbbbbb] flex items-center justify-between px-10 py-4 w-full bg-white">
      <div className="h-12 w-[126px] relative">
        <img alt="Yakiwood Logo" className="w-full h-full object-contain" src={imgLogo} />
      </div>
      
      <nav className="flex gap-10 items-center">
        {['Products', 'Solutions', 'Projects', 'About', 'Contact'].map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="font-['Outfit'] font-normal text-xs text-[#161616] tracking-[0.6px] uppercase hover:opacity-70 transition-opacity"
          >
            {item}
          </a>
        ))}
      </nav>

      <div className="flex gap-2 items-center">
        <button className="border border-[#535353] rounded-full flex gap-2 h-12 items-center justify-center px-6 py-2.5 hover:bg-[#161616] hover:text-white transition-colors group">
          <img alt="Shopping cart" className="w-6 h-6" src={imgCart} />
          <span className="font-['Outfit'] font-normal text-xs tracking-[0.6px] uppercase group-hover:text-white">CART</span>
        </button>
      </div>
    </header>
  );
}
