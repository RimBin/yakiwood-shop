import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/products';

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

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
    woodType: dbProduct.wood_type,
    image: dbProduct.image_url || dbProduct.image || '/assets/placeholder.png',
    images:
      dbProduct.images?.map((img: any) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text || dbProduct.name,
        isPrimary: img.is_primary || false,
        order: img.display_order || 0,
      })) || [],
    variants:
      dbProduct.variants?.map((v: any) => ({
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

export async function fetchProduct(slug: string): Promise<Product | null> {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
        *,
        images:product_images(*),
        variants:product_variants(*),
        configurations:product_configurations(*)
      `
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    return null;
  }

  return transformDatabaseProduct(product);
}
