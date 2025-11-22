"use client";

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart/store';

function PlaceholderModel() {
  // Simple box until real GLTF is loaded
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  );
}

export interface Konfiguratorius3DProps {
  productId?: string;
}

export default function Konfiguratorius3D({ productId }: Konfiguratorius3DProps) {
  const t = useTranslations('configurator');
  const [color, setColor] = useState('#444444');
  const [finish, setFinish] = useState('natural');
  const addItem = useCartStore(s => s.addItem);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 mt-10">
      <div className="flex-1 h-[400px] border border-[#bbbbbb] rounded-lg overflow-hidden bg-[#eaeaea]">
        <Canvas camera={{ position: [2, 2, 2], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={null}>
            <PlaceholderModel />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      <div className="w-full md:w-[320px] flex flex-col gap-6">
        <h3 className="font-['DM_Sans'] text-xl font-medium tracking-[-0.5px]">{t('title')}</h3>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-['Outfit'] uppercase tracking-[0.6px]">{t('color')}</label>
            <div className="flex gap-2">
              {['#444444', '#2d2419', '#1a1410', '#0a0806'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`h-8 w-8 rounded-full border ${color === c ? 'scale-110 ring-2 ring-[#161616]' : ''} transition-transform`}
                  aria-label={`Pasirinkti spalvą ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-['Outfit'] uppercase tracking-[0.6px]">{t('finish')}</label>
            <select
              value={finish}
              onChange={(e) => setFinish(e.target.value)}
              className="border border-[#bbbbbb] rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="natural">Natural</option>
              <option value="espresso">Espresso</option>
              <option value="charcoal">Charcoal</option>
            </select>
          </div>
          <button
            className="mt-2 h-12 rounded-full bg-[#161616] text-white font-['Outfit'] text-xs tracking-[0.6px] uppercase hover:opacity-80"
            onClick={() => {
              if (!productId) return;
              addItem({
                id: productId,
                name: 'Konfigūruotas produktas',
                slug: 'custom',
                basePrice: 0, // bus pakeista realia kaina iš DB
                color,
                finish,
              });
            }}
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
