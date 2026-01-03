"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type { ProductColorVariant, ProductProfileVariant } from '@/lib/products.sanity';

interface PlaceholderModelProps {
  color: string;
}

function PlaceholderModel({ color }: PlaceholderModelProps) {
  // Simple box until real GLTF is loaded
  return (
    <mesh>
      <boxGeometry args={[2, 0.2, 1]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}

export interface Konfiguratorius3DProps {
  productId: string;
  availableColors: ProductColorVariant[];
  availableFinishes: ProductProfileVariant[];
  onColorChange?: (color: ProductColorVariant) => void;
  onFinishChange?: (finish: ProductProfileVariant) => void;
  className?: string;
  isLoading?: boolean;
}

export default function Konfiguratorius3D({ 
  productId,
  availableColors, 
  availableFinishes,
  onColorChange,
  onFinishChange,
  className = '',
  isLoading = false,
}: Konfiguratorius3DProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(
    availableColors[0] || null
  );
  const [selectedFinish, setSelectedFinish] = useState<ProductProfileVariant | null>(
    availableFinishes[0] || null
  );
  const [modelColor, setModelColor] = useState('#444444');

  useEffect(() => {
    if (selectedColor?.hex) {
      setModelColor(selectedColor.hex);
    }
  }, [selectedColor]);

  const handleColorSelect = (color: ProductColorVariant) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  const handleFinishSelect = (finish: ProductProfileVariant) => {
    setSelectedFinish(finish);
    onFinishChange?.(finish);
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${className}`}>
      {/* 3D Canvas */}
      <div className="relative w-full h-[400px] md:h-[500px] border border-[#BBBBBB] rounded-[24px] overflow-hidden bg-[#EAEAEA]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EAEAEA] z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#BBBBBB] border-t-[#161616] rounded-full animate-spin" />
              <p className="font-['Outfit'] text-sm text-[#7C7C7C]">Kraunamas 3D modelis...</p>
            </div>
          </div>
        )}
        
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <PlaceholderModel color={modelColor} />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>

        {/* 3D Controls hint */}
        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-xs font-['Outfit'] text-[#535353]">
          Naudokite pelę norėdami pasukti, priartinti ir perkelti
        </div>
      </div>

      {/* Color Selector */}
      {availableColors.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
            Spalva
            {selectedColor && (
              <span className="ml-2 font-['Outfit'] font-normal text-[#7C7C7C]">
                ({selectedColor.name})
              </span>
            )}
          </label>
          <div className="flex flex-wrap gap-3">
            {availableColors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorSelect(color)}
                className={`relative group ${
                  selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                }`}
                aria-label={`Pasirinkti spalvą ${color.name}`}
                title={color.name}
              >
                {color.image ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors">
                    <img 
                      src={color.image} 
                      alt={color.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    style={{ backgroundColor: color.hex }}
                    className="w-12 h-12 rounded-lg border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors"
                  />
                )}
                
                {color.priceModifier !== 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#161616] text-white text-[10px] px-1.5 py-0.5 rounded-full font-['Outfit']">
                    {color.priceModifier > 0 ? '+' : ''}€{color.priceModifier.toFixed(0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finish Selector */}
      {availableFinishes.length > 0 && (
        <div className="flex flex-col gap-3">
          <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
            Profilis
          </label>
          <div className="grid grid-cols-1 gap-2">
            {availableFinishes.map((finish) => (
              <label
                key={finish.id}
                className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFinish?.id === finish.id
                    ? 'border-[#161616] bg-[#F9F9F9]'
                    : 'border-[#EAEAEA] hover:border-[#BBBBBB]'
                }`}
              >
                <input
                  type="radio"
                  name="finish"
                  value={finish.id}
                  checked={selectedFinish?.id === finish.id}
                  onChange={() => handleFinishSelect(finish)}
                  className="mt-0.5 w-4 h-4 text-[#161616] focus:ring-[#161616]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-['DM_Sans'] font-medium text-[#161616]">
                      {finish.name}
                    </span>
                    {finish.priceModifier !== 0 && (
                      <span className="font-['Outfit'] text-sm text-[#535353]">
                        {finish.priceModifier > 0 ? '+' : ''}€{finish.priceModifier.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {finish.description && (
                    <p className="mt-1 font-['Outfit'] text-xs text-[#7C7C7C]">
                      {finish.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="p-4 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA]">
        <p className="font-['Outfit'] text-xs text-[#535353]">
          💡 <strong>Pastaba:</strong> Tikroji spalva ir tekstūra gali šiek tiek skirtis 
          nuo čia rodomos. Kiekviena lentelė yra unikali dėl natūralios medienos savybių.
        </p>
      </div>
    </div>
  );
}
