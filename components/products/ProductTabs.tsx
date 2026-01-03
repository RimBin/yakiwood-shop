'use client';

import React, { useState } from 'react';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { Product } from '@/lib/products.sanity';

interface ProductTabsProps {
  product: Product;
}

type TabType = 'description' | 'specifications' | 'installation' | 'reviews';

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('description');

  const tabs = [
    { id: 'description' as TabType, label: 'Aprašymas', enabled: true },
    { id: 'specifications' as TabType, label: 'Specifikacijos', enabled: !!product.specifications && product.specifications.length > 0 },
    { id: 'installation' as TabType, label: 'Montavimas', enabled: false },
    { id: 'reviews' as TabType, label: 'Atsiliepimai', enabled: false }, // Future feature
  ];

  const portableComponents: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className="font-['Outfit'] text-[#161616] leading-relaxed">{children}</p>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="list-disc pl-6 space-y-2 font-['Outfit'] text-[#161616]">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="list-decimal pl-6 space-y-2 font-['Outfit'] text-[#161616]">{children}</ol>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-semibold text-[#161616]">{children}</strong>,
      em: ({ children }) => <em className="italic text-[#535353]">{children}</em>,
    },
  };

  return (
    <div className="w-full mt-12">
      {/* Tab Navigation */}
      <div className="border-b border-[#BBBBBB] overflow-x-auto">
        <div className="flex gap-8 min-w-max">
          {tabs.filter(tab => tab.enabled).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-['DM_Sans'] text-base transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#161616] font-medium'
                  : 'text-[#7C7C7C] hover:text-[#161616]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#161616]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="prose max-w-none space-y-4">
            {product.descriptionPortable ? (
              <PortableText value={product.descriptionPortable} components={portableComponents} />
            ) : (
              <p className="font-['Outfit'] text-[#161616] leading-relaxed">
                {product.description || 'Informacija ruošiama.'}
              </p>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specifications' && product.specifications && (
          <div className="grid gap-4">
            <table className="w-full border-collapse">
              <tbody>
                {product.specifications.map((spec, index) => (
                  <tr 
                    key={spec.label}
                    className={`border-b border-[#EAEAEA] ${
                      index % 2 === 0 ? 'bg-[#F9F9F9]' : 'bg-white'
                    }`}
                  >
                    <td className="py-4 px-6 font-['DM_Sans'] font-medium text-[#161616] w-1/3">
                      {spec.label}
                    </td>
                    <td className="py-4 px-6 font-['Outfit'] text-[#535353]">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Additional technical info */}
            <div className="mt-8 p-6 bg-[#F9F9F9] rounded-[24px]">
              <h4 className="font-['DM_Sans'] font-medium text-[#161616] mb-3">
                Techninės pastabos:
              </h4>
              <ul className="space-y-2 text-sm font-['Outfit'] text-[#535353]">
                <li>• Medžiagos natūralumas: kiekviena lentelė yra unikali</li>
                <li>• Spalvos atspalvis gali skirtis nuo nuotraukose matyto</li>
                <li>• Rekomenduojama laikyti sausoje, vėdinamoje patalpoje</li>
              </ul>
            </div>
          </div>
        )}

        {/* Installation Tab */}
        {activeTab === 'installation' && (
          <div className="text-center py-12">
            <p className="font-['Outfit'] text-[#7C7C7C]">
              Montavimo instrukcijos bus pridėtos greitai.
            </p>
          </div>
        )}

        {/* Reviews Tab (Placeholder) */}
        {activeTab === 'reviews' && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EAEAEA] rounded-full mb-4">
              <svg 
                className="w-8 h-8 text-[#BBBBBB]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-lg font-medium mb-2">
              Atsiliepimų kol kas nėra
            </h3>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-6">
              Būkite pirmas, kuris pasidalins savo nuomone apie šį produktą
            </p>
            <button 
              className="px-6 py-3 bg-[#161616] text-white rounded-full font-['Outfit'] text-sm hover:bg-[#2d2d2d] transition-colors"
              disabled
            >
              Rašyti atsiliepimą (netrukus)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
