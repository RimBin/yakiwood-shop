'use client';

import Image from 'next/image';

// Single swatch component for use in product cards
interface SingleSwatchProps {
  image: string;
  name: string;
  isSelected?: boolean;
  size?: 'small' | 'large';
  onClick?: () => void;
}

export default function ColorSwatch({ 
  image, 
  name, 
  isSelected = false, 
  size = 'large',
  onClick 
}: SingleSwatchProps) {
  const baseSize = size === 'large' ? 32 : 32;
  const selectedSize = size === 'large' ? 42 : 42;

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center rounded-[4px] shrink-0 transition-all ${
        isSelected ? `w-[${selectedSize}px] h-[${selectedSize}px]` : `w-[${baseSize}px] h-[${baseSize}px]`
      }`}
      title={name}
      type="button"
    >
      <Image
        src={image}
        alt={name}
        width={baseSize}
        height={baseSize}
        className="rounded-[4px] object-cover"
      />
      {isSelected && (
        <div className="absolute -inset-[5px] rounded-[4px] border-2 border-[#161616]" />
      )}
    </button>
  );
}

// Multi-color selector component
interface ColorSwatchGroupProps {
  colors: {
    id: string;
    name: string;
    image: string;
  }[];
  selectedColorId?: string;
  onColorSelect: (colorId: string) => void;
  showLabel?: boolean;
  size?: 'small' | 'large';
}

export function ColorSwatchGroup({ 
  colors, 
  selectedColorId, 
  onColorSelect, 
  showLabel = true,
  size = 'large' 
}: ColorSwatchGroupProps) {
  const selectedColor = colors.find(c => c.id === selectedColorId);

  return (
    <div className="flex flex-col gap-[8px]">
      {showLabel && (
        <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
          <span className="text-[#7c7c7c]">Color:</span>
          {selectedColor && (
            <span className="text-[#161616]">{selectedColor.name}</span>
          )}
        </div>
      )}
      <div className="flex gap-[8px] items-center overflow-x-auto h-[43px]">
        {colors.map((color) => (
          <ColorSwatch
            key={color.id}
            image={color.image}
            name={color.name}
            isSelected={selectedColorId === color.id}
            size={size}
            onClick={() => onColorSelect(color.id)}
          />
        ))}
      </div>
    </div>
  );
}
