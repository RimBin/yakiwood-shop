import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import groq from 'groq';
import type { PortableTextBlock } from 'sanity';

const USAGE_TYPE_LABELS: Record<string, string> = {
  facade: 'Fasadų dailylentės',
  terrace: 'Terasų lentos',
};

const WOOD_TYPE_LABELS: Record<string, string> = {
  larch: 'Maumedis',
  spruce: 'Eglė',
};

interface SanityColorVariant {
  _key?: string;
  name: string;
  slug?: { current: string };
  hex?: string;
  image?: any;
  description?: string;
  priceModifier?: number;
}

interface SanityProfileVariant {
  _key?: string;
  name: string;
  code?: string;
  description?: string;
  priceModifier?: number;
  image?: any;
  dimensions?: {
    width?: number;
    thickness?: number;
    length?: number;
  };
}

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: PortableTextBlock[];
  category: string;
  basePrice: number;
  images?: any[];
  colorVariants?: SanityColorVariant[];
  profiles?: SanityProfileVariant[];
  dimensions?: {
    width?: number;
    height?: number;
    thickness?: number;
    length?: number;
  };
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  woodType?: string;
  inStock?: boolean;
}

export interface ProductColorVariant {
  id: string;
  name: string;
  hex?: string;
  image?: string;
  description?: string;
  priceModifier?: number;
}

export interface ProductProfileVariant {
  id: string;
  name: string;
  code?: string;
  description?: string;
  priceModifier?: number;
  dimensions?: {
    width?: number;
    thickness?: number;
    length?: number;
  };
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  usageLabel?: string;
  woodType?: string;
  woodLabel?: string;
  description?: string;
  descriptionPortable?: PortableTextBlock[];
  images?: string[];
  colors?: ProductColorVariant[];
  profiles?: ProductProfileVariant[];
  dimensions?: {
    width?: number;
    height?: number;
    thickness?: number;
    length?: number;
  };
  specifications?: Array<{
    label: string;
    value: string;
  }>;
  inStock?: boolean;
}

function blocksToPlainText(blocks?: PortableTextBlock[]): string {
  if (!blocks) return '';
  return blocks
    .map((block) => {
      if (Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text).join('');
      }
      return '';
    })
    .join('\n\n')
    .trim();
}

/**
 * Fetch all active products from Sanity
 * NOTE: Currently includes draft products for development
 */
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Include both published and draft products
    // Drafts are preferred over published versions with the same ID
    const query = groq`*[_type == "product"] | order(_createdAt desc) {
      _id,
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      colorVariants,
      profiles,
      dimensions,
      specifications,
      woodType,
      inStock
    }`;

    console.log('Fetching products from Sanity...');
    const products = await client.fetch<SanityProduct[]>(query);
    console.log(`Fetched ${products.length} products from Sanity`);

    if (products.length === 0) {
      console.warn('No products found in Sanity. Make sure products are created and published in Sanity Studio.');
    }

    return products.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching products from Sanity:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      
      // Check if it's an authentication error
      if (error.message.includes('Request error') || error.message.includes('401') || error.message.includes('403')) {
        console.error('\n⚠️  SANITY API TOKEN ISSUE:');
        console.error('Make sure SANITY_API_TOKEN is set in .env.local');
        console.error('Get your token from: https://sanity.io/manage/personal/tokens');
        console.error('Or run: npx sanity manage');
      }
    }
    throw error; // Re-throw to allow component to handle
  }
}

/**
 * Fetch a single product by slug from Sanity
 */
export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const query = groq`*[_type == "product" && slug.current == $slug][0] {
      _id,
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      colorVariants,
      profiles,
      dimensions,
      specifications,
      woodType,
      inStock
    }`;

    const product = await client.fetch<SanityProduct>(query, { slug });

    if (!product) {
      return null;
    }

    return transformSanityProduct(product);
  } catch (error) {
    console.error('Error fetching product from Sanity:', error);
    return null;
  }
}

/**
 * Fetch products by category from Sanity
 */
export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const query = groq`*[_type == "product" && category == $category && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      colorVariants,
      profiles,
      dimensions,
      woodType
    }`;

    const products = await client.fetch<SanityProduct[]>(query, { category });

    return products.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching products by category from Sanity:', error);
    return [];
  }
}

/**
 * Fetch products by wood type from Sanity
 */
export async function fetchProductsByWoodType(woodType: string): Promise<Product[]> {
  try {
    const query = groq`*[_type == "product" && woodType == $woodType && !(_id in path("drafts.**"))] | order(_createdAt desc) {
      _id,
      name,
      slug,
      description,
      category,
      basePrice,
      images,
      colorVariants,
      profiles,
      dimensions,
      woodType
    }`;

    const products = await client.fetch<SanityProduct[]>(query, { woodType });

    return products.map(transformSanityProduct);
  } catch (error) {
    console.error('Error fetching products by wood type from Sanity:', error);
    return [];
  }
}

/**
 * Transform Sanity product to app Product type
 */
function transformSanityProduct(sanityProduct: SanityProduct): Product {
  const firstImage = sanityProduct.images?.[0];
  const imageUrl = firstImage ? urlFor(firstImage).width(800).url() : '/assets/imgSpruce.png';

  const images = sanityProduct.images?.map((img) => urlFor(img).width(1000).url()) || [];

  const colors = sanityProduct.colorVariants?.map((color, index) => ({
    id: color._key || color.slug?.current || `${sanityProduct._id}-color-${index}`,
    name: color.name,
    hex: color.hex,
    image: color.image ? urlFor(color.image).width(400).url() : undefined,
    description: color.description,
    priceModifier: color.priceModifier || 0,
  }));

  const profiles = sanityProduct.profiles?.map((profile, index) => ({
    id: profile._key || `${sanityProduct._id}-profile-${index}`,
    name: profile.name,
    code: profile.code,
    description: profile.description,
    priceModifier: profile.priceModifier || 0,
    dimensions: profile.dimensions,
    image: profile.image ? urlFor(profile.image).width(500).url() : undefined,
  }));

  const descriptionText = blocksToPlainText(sanityProduct.description);

  const usageLabel = USAGE_TYPE_LABELS[sanityProduct.category] || sanityProduct.category;
  const woodLabel = sanityProduct.woodType ? WOOD_TYPE_LABELS[sanityProduct.woodType] || sanityProduct.woodType : undefined;

  return {
    id: sanityProduct._id,
    slug: sanityProduct.slug.current,
    name: sanityProduct.name,
    price: sanityProduct.basePrice,
    image: imageUrl,
    images,
    category: sanityProduct.category,
    usageLabel,
    woodType: sanityProduct.woodType,
    woodLabel,
    description: descriptionText,
    descriptionPortable: sanityProduct.description,
    colors,
    profiles,
    dimensions: sanityProduct.dimensions,
    specifications: sanityProduct.specifications,
    inStock: sanityProduct.inStock,
  };
}

export async function fetchRelatedProducts(params: {
  usageType?: string;
  woodType?: string;
  excludeSlug: string;
  limit?: number;
}): Promise<Product[]> {
  const { usageType, woodType, excludeSlug, limit = 4 } = params;

  const query = groq`*[_type == "product" && slug.current != $excludeSlug && (!defined($usageType) || category == $usageType) && (!defined($woodType) || woodType == $woodType)] | order(_createdAt desc)[0...$limit] {
    _id,
    name,
    slug,
    description,
    category,
    basePrice,
    images,
    colorVariants,
    profiles,
    woodType,
    inStock
  }`;

  const related = await client.fetch<SanityProduct[]>(query, {
    usageType,
    woodType,
    excludeSlug,
    limit,
  });

  return related.map(transformSanityProduct);
}
