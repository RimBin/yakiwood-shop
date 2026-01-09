/**
 * Product utility functions for fetching and managing product data
 */

import { createClient } from '@/lib/supabase/client';
import type { ProductSchema } from '@/lib/seo/structured-data';

export interface Color {
  id: string;
  name: string;
  hex: string;
  image?: string;
  priceModifier: number; // percentage or fixed amount
}

export interface Finish {
  id: string;
  name: string;
  description?: string;
  priceModifier: number; // percentage or fixed amount
}

export interface ProductVariant {
  id: string;
  sku: string;
  colorId?: string;
  finishId?: string;
  width?: number;
  length?: number;
  priceModifier: number;
  stockQuantity?: number;
  isAvailable: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  sku?: string;
  category?: string;
  usageType?: string;
  woodType?: string;
  image: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  availableColors?: Color[];
  availableFinishes?: Finish[];
  specifications?: Record<string, string>;
  features?: string[];
  installationGuide?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

/**
 * Fetch a single product by slug from Supabase
 */
export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return null;
    }
    
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        variants:product_variants(*),
        configurations:product_configurations(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !product) {
      console.error('Error fetching product:', error);
      return null;
    }

    // Transform database structure to our Product interface
    return transformDatabaseProduct(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Fetch related products (same category or wood type)
 */
export async function getRelatedProducts(
  productId: string,
  limit: number = 4
): Promise<Product[]> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return [];
    }
    
    // First get the current product to find related criteria
    const { data: currentProduct } = await supabase
      .from('products')
      .select('category, wood_type')
      .eq('id', productId)
      .single();

    if (!currentProduct) return [];

    // Fetch related products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .neq('id', productId)
      .eq('is_active', true)
      .or(`category.eq.${currentProduct.category},wood_type.eq.${currentProduct.wood_type}`)
      .limit(limit);

    if (error || !products) {
      console.error('Error fetching related products:', error);
      return [];
    }

    return products.map(transformDatabaseProduct);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return [];
  }
}

/**
 * Generate JSON-LD Product schema for SEO
 */
export function generateProductSchema(product: Product): ProductSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url) || [product.image],
    sku: product.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Yakiwood',
    },
    offers: {
      '@type': 'Offer',
      url: `https://yakiwood.lt/produktai/${product.slug}`,
      priceCurrency: 'EUR',
      price: product.basePrice,
      availability: product.isActive 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Yakiwood',
      },
    },
    category: product.category,
    material: product.woodType,
  };
}

/**
 * Generate breadcrumb JSON-LD schema
 */
export function generateBreadcrumbSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Pagrindinis',
        item: 'https://yakiwood.lt',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produktai',
        item: 'https://yakiwood.lt/produktai',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://yakiwood.lt/produktai/${product.slug}`,
      },
    ],
  };
}

/**
 * Transform database product to app Product interface
 */
function transformDatabaseProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description || '',
    shortDescription: dbProduct.short_description,
    basePrice: dbProduct.base_price || dbProduct.price || 0,
    sku: dbProduct.sku,
    category: dbProduct.category,
    usageType: dbProduct.usage_type,
    woodType: dbProduct.wood_type,
    image: dbProduct.image_url || dbProduct.image || '/images/ui/wood/imgSpruce.png',
    images: dbProduct.images?.map((img: any) => ({
      id: img.id,
      url: img.image_url,
      alt: img.alt_text || dbProduct.name,
      isPrimary: img.is_primary || false,
      order: img.display_order || 0,
    })) || [],
    variants: dbProduct.variants?.map((v: any) => ({
      id: v.id,
      sku: v.sku,
      colorId: v.color_id,
      finishId: v.finish_id,
      width: v.width,
      length: v.length,
      priceModifier: v.price_modifier || 0,
      stockQuantity: v.stock_quantity,
      isAvailable: v.is_available ?? true,
    })) || [],
    specifications: dbProduct.specifications || {},
    features: dbProduct.features || [],
    installationGuide: dbProduct.installation_guide,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
    isActive: dbProduct.is_active ?? true,
  };
}

/**
 * Check if product variant is in stock
 */
export function isVariantInStock(variant?: ProductVariant): boolean {
  if (!variant) return true; // No variant = base product available
  if (!variant.isAvailable) return false;
  if (variant.stockQuantity === undefined || variant.stockQuantity === null) return true;
  return variant.stockQuantity > 0;
}

/**
 * Get available colors from product configurations
 */
export async function getProductColors(productId: string): Promise<Color[]> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('product_configurations')
      .select('*')
      .eq('product_id', productId)
      .eq('type', 'color');

    if (error || !data) return [];

    return data.map((config: any) => ({
      id: config.id,
      name: config.name,
      hex: config.value,
      image: config.image_url,
      priceModifier: config.price_modifier || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    return [];
  }
}

/**
 * Get available finishes from product configurations
 */
export async function getProductFinishes(productId: string): Promise<Finish[]> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('product_configurations')
      .select('*')
      .eq('product_id', productId)
      .eq('type', 'finish');

    if (error || !data) return [];

    return data.map((config: any) => ({
      id: config.id,
      name: config.name,
      description: config.description,
      priceModifier: config.price_modifier || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch finishes:', error);
    return [];
  }
}
