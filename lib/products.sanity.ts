import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import groq from 'groq';

export interface SanityProduct {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  category: string;
  basePrice: number;
  images?: any[];
  finishes?: Array<{
    name: string;
    colorCode?: string;
    image?: any;
    priceModifier?: number;
  }>;
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
  isActive?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  images?: string[];
  finishes?: Array<{
    name: string;
    colorCode?: string;
    image?: string;
    priceModifier?: number;
  }>;
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
      finishes,
      dimensions,
      specifications,
      woodType
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
      finishes,
      dimensions,
      specifications,
      woodType
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
      finishes,
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
      finishes,
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

  const images = sanityProduct.images?.map((img) => urlFor(img).width(800).url()) || [];

  const finishes = sanityProduct.finishes?.map((finish) => ({
    name: finish.name,
    colorCode: finish.colorCode,
    image: finish.image ? urlFor(finish.image).width(400).url() : undefined,
    priceModifier: finish.priceModifier || 0,
  }));

  return {
    id: sanityProduct._id,
    slug: sanityProduct.slug.current,
    name: sanityProduct.name,
    price: sanityProduct.basePrice,
    image: imageUrl,
    images,
    category: sanityProduct.category,
    description: sanityProduct.description,
    finishes,
    dimensions: sanityProduct.dimensions,
    specifications: sanityProduct.specifications,
    woodType: sanityProduct.woodType,
  };
}
