// Admin product management types

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string;
  variant_type: 'color' | 'finish';
  hex_color?: string;
  price_adjustment?: number;
  description?: string;
  texture_url?: string;
  stock_quantity?: number;
  sku?: string;
  is_available: boolean;
  created_at?: string;
  tempId?: string; // For new variants not yet saved
}

export interface Product {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  category: string;
  usage_type?: string;
  wood_type: string;
  base_price: number;
  is_active: boolean;
  stock_quantity?: number;
  sku?: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  image?: string;
  model_3d_url?: string;
  created_at: string;
  updated_at?: string;
  variants?: ProductVariant[];
}

export interface ProductFormData {
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  category: string;
  usage_type?: string;
  wood_type: string;
  base_price: number;
  status: 'draft' | 'published';
  stock_quantity?: number;
  sku?: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  image?: string;
  variants?: ProductVariant[];
}

export interface ProductFilters {
  search: string;
  category: string;
  status: string;
}

export type ProductCategory = 'cladding' | 'decking' | 'interior' | 'tiles';
export type WoodType = 'larch' | 'spruce';
export type UsageType = 'facade' | 'terrace' | 'interior' | 'fence';

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'cladding', label: 'Fasadai' },
  { value: 'decking', label: 'Lentos' },
  { value: 'interior', label: 'Interjeras' },
  { value: 'tiles', label: 'Plytelės' },
];

export const WOOD_TYPES: { value: WoodType; label: string }[] = [
  { value: 'larch', label: 'Maumedis (Larch)' },
  { value: 'spruce', label: 'Eglė (Spruce)' },
];


export const USAGE_TYPES: { value: UsageType; label: string }[] = [
  { value: 'facade', label: 'Fasadui (Facade)' },
  { value: 'terrace', label: 'Terasai (Terrace)' },
  { value: 'interior', label: 'Interjerui (Interior)' },
  { value: 'fence', label: 'Tvoroms (Fence)' },
];
