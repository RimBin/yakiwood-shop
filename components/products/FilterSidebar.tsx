"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import RangeSlider from '@/components/ui/RangeSlider';
import { Minus } from '@/components/icons/Minus';
import { Plus } from '@/components/icons/Plus';

export interface ProductFilters {
  priceRange: [number, number];
  categories: string[];
  woodTypes: string[];
  colors: string[];
  finish?: string;
  inStockOnly: boolean;
}

interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  productCount?: number;
  className?: string;
}

const CATEGORIES = ['Lentos', 'Plytelės', 'Fasadai', 'Interjeras'];
const WOOD_TYPES = ['Pušis', 'Eglė', 'Ąžuolas'];
const COLORS = [
  { name: 'Juoda', hex: '#161616' },
  { name: 'Ruda', hex: '#8B4513' },
  { name: 'Pilka', hex: '#808080' },
  { name: 'Natūrali', hex: '#D2B48C' },
];
const FINISHES = ['Matinė', 'Blizgi', 'Natūrali'];

export default function FilterSidebar({
  filters,
  onFilterChange,
  productCount,
  className = '',
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'category', 'woodType', 'color', 'finish', 'availability'])
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handlePriceChange = (range: [number, number]) => {
    setLocalFilters({ ...localFilters, priceRange: range });
  };

  const handleCategoryToggle = (category: string) => {
    const categories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];
    setLocalFilters({ ...localFilters, categories });
  };

  const handleWoodTypeToggle = (woodType: string) => {
    const woodTypes = localFilters.woodTypes.includes(woodType)
      ? localFilters.woodTypes.filter((w) => w !== woodType)
      : [...localFilters.woodTypes, woodType];
    setLocalFilters({ ...localFilters, woodTypes });
  };

  const handleColorToggle = (color: string) => {
    const colors = localFilters.colors.includes(color)
      ? localFilters.colors.filter((c) => c !== color)
      : [...localFilters.colors, color];
    setLocalFilters({ ...localFilters, colors });
  };

  const handleFinishChange = (finish: string) => {
    setLocalFilters({ ...localFilters, finish: finish === localFilters.finish ? undefined : finish });
  };

  const handleInStockToggle = () => {
    setLocalFilters({ ...localFilters, inStockOnly: !localFilters.inStockOnly });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.priceRange[0] !== 0 || localFilters.priceRange[1] !== 500) count++;
    count += localFilters.categories.length;
    count += localFilters.woodTypes.length;
    count += localFilters.colors.length;
    if (localFilters.finish) count++;
    if (localFilters.inStockOnly) count++;
    return count;
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    
    // Update URL query params
    const params = new URLSearchParams(searchParams.toString());
    
    if (localFilters.priceRange[0] !== 0 || localFilters.priceRange[1] !== 500) {
      params.set('priceMin', localFilters.priceRange[0].toString());
      params.set('priceMax', localFilters.priceRange[1].toString());
    } else {
      params.delete('priceMin');
      params.delete('priceMax');
    }
    
    if (localFilters.categories.length > 0) {
      params.set('categories', localFilters.categories.join(','));
    } else {
      params.delete('categories');
    }
    
    if (localFilters.woodTypes.length > 0) {
      params.set('woodTypes', localFilters.woodTypes.join(','));
    } else {
      params.delete('woodTypes');
    }
    
    if (localFilters.colors.length > 0) {
      params.set('colors', localFilters.colors.join(','));
    } else {
      params.delete('colors');
    }
    
    if (localFilters.finish) {
      params.set('finish', localFilters.finish);
    } else {
      params.delete('finish');
    }
    
    if (localFilters.inStockOnly) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const clearFilters = () => {
    const defaultFilters: ProductFilters = {
      priceRange: [0, 500],
      categories: [],
      woodTypes: [],
      colors: [],
      finish: undefined,
      inStockOnly: false,
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
    router.push(window.location.pathname, { scroll: false });
    setIsOpen(false);
  };

  const activeCount = getActiveFilterCount();

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-['DM_Sans'] font-medium text-[#161616]">Filtrai</h2>
        {activeCount > 0 && (
          <span className="px-2.5 py-1 bg-[#161616] text-white text-xs font-['DM_Sans'] rounded-full">
            {activeCount}
          </span>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-[#E1E1E1] pb-6">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Kaina</span>
          {expandedSections.has('price') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('price') && (
          <RangeSlider
            min={0}
            max={500}
            value={localFilters.priceRange}
            onChange={handlePriceChange}
            step={10}
          />
        )}
      </div>

      {/* Category */}
      <div className="border-b border-[#E1E1E1] pb-6">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Kategorija</span>
          {expandedSections.has('category') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('category') && (
          <div className="space-y-3">
            {CATEGORIES.map((category) => (
              <label key={category} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.categories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 border-2 border-[#E1E1E1] rounded text-[#161616] focus:ring-2 focus:ring-[#161616] focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm font-['DM_Sans'] text-[#161616] group-hover:text-[#535353] transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Wood Type */}
      <div className="border-b border-[#E1E1E1] pb-6">
        <button
          onClick={() => toggleSection('woodType')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Medžio rūšis</span>
          {expandedSections.has('woodType') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('woodType') && (
          <div className="space-y-3">
            {WOOD_TYPES.map((woodType) => (
              <label key={woodType} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.woodTypes.includes(woodType)}
                  onChange={() => handleWoodTypeToggle(woodType)}
                  className="w-4 h-4 border-2 border-[#E1E1E1] rounded text-[#161616] focus:ring-2 focus:ring-[#161616] focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm font-['DM_Sans'] text-[#161616] group-hover:text-[#535353] transition-colors">
                  {woodType}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="border-b border-[#E1E1E1] pb-6">
        <button
          onClick={() => toggleSection('color')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Spalva</span>
          {expandedSections.has('color') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('color') && (
          <div className="grid grid-cols-2 gap-3">
            {COLORS.map((color) => (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                  localFilters.colors.includes(color.name)
                    ? 'border-[#161616] bg-[#EAEAEA]'
                    : 'border-[#E1E1E1] hover:border-[#BBBBBB]'
                }`}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm font-['DM_Sans'] text-[#161616]">{color.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Finish */}
      <div className="border-b border-[#E1E1E1] pb-6">
        <button
          onClick={() => toggleSection('finish')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Apdaila</span>
          {expandedSections.has('finish') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('finish') && (
          <div className="space-y-3">
            {FINISHES.map((finish) => (
              <label key={finish} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="finish"
                  checked={localFilters.finish === finish}
                  onChange={() => handleFinishChange(finish)}
                  className="w-4 h-4 border-2 border-[#E1E1E1] text-[#161616] focus:ring-2 focus:ring-[#161616] focus:ring-offset-0 cursor-pointer"
                />
                <span className="ml-3 text-sm font-['DM_Sans'] text-[#161616] group-hover:text-[#535353] transition-colors">
                  {finish}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="pb-6">
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full text-left mb-4"
        >
          <span className="text-base font-['DM_Sans'] font-medium text-[#161616]">Prieinamumas</span>
          {expandedSections.has('availability') ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
        {expandedSections.has('availability') && (
          <label className="flex items-center cursor-pointer group">
            <button
              onClick={handleInStockToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                localFilters.inStockOnly ? 'bg-[#161616]' : 'bg-[#E1E1E1]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  localFilters.inStockOnly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm font-['DM_Sans'] text-[#161616] group-hover:text-[#535353] transition-colors">
              Tik sandėlyje
            </span>
          </label>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={applyFilters}
          className="w-full py-3 px-6 bg-[#161616] text-white font-['DM_Sans'] font-medium rounded-[24px] hover:bg-[#535353] transition-colors"
        >
          Taikyti filtrus
          {productCount !== undefined && ` (${productCount})`}
        </button>
        <button
          onClick={clearFilters}
          className="w-full py-3 px-6 border-2 border-[#E1E1E1] text-[#161616] font-['DM_Sans'] font-medium rounded-[24px] hover:border-[#161616] transition-colors"
        >
          Išvalyti filtrus
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-40 px-6 py-3 bg-[#161616] text-white font-['DM_Sans'] font-medium rounded-[100px] shadow-lg flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Filtrai
        {activeCount > 0 && (
          <span className="px-2 py-0.5 bg-white text-[#161616] text-xs rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full w-80 max-w-full bg-white z-50 transform transition-transform duration-300 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-[#161616] hover:bg-[#EAEAEA] rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FilterContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block ${className}`}>
        <div className="sticky top-6">
          <FilterContent />
        </div>
      </aside>
    </>
  );
}
