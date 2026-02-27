/**
 * Product 3D Model Registry
 *
 * Uses index.json exported from Blender as the primary source of truth for
 * slug → GLB mappings.  Falls back to category+woodType combo, then to the
 * generic configurator model.
 *
 * To add a new model:
 * 1. Export from Blender as .glb (see public/models/products/README.md)
 * 2. Place the file + updated index.json in public/models/products/
 * 3. English slug aliases are auto-generated below — extend if the pattern changes
 */

import blenderIndex from '@/public/models/products/index.json';

// ---------------------------------------------------------------------------
// Version stamp appended as cache-buster query string.  Bump when you replace
// a GLB file so browsers refetch it.
// ---------------------------------------------------------------------------
const MODEL_VERSION = '20260226a';

function versioned(path: string): string {
  return `${path}?v=${MODEL_VERSION}`;
}

// ---------------------------------------------------------------------------
// Generic fallback model (already shipped with the project).
// ---------------------------------------------------------------------------
const FALLBACK_MODEL_URL = versioned('/models/configurator/model.glb');

// ---------------------------------------------------------------------------
// Primary slug → model map built from Blender's index.json (32 entries).
// Each value is a path like "/models/products/spruce-facade.glb".
// ---------------------------------------------------------------------------
const PRODUCT_MODEL_MAP: Record<string, string> = {};

for (const [slug, path] of Object.entries(blenderIndex)) {
  PRODUCT_MODEL_MAP[slug] = versioned(path);
}

// ---------------------------------------------------------------------------
// English slug aliases  (Pattern: shou-sugi-ban-for-<type>-<wood>-<color>)
// Auto-derived from the Lithuanian slugs in index.json.
// ---------------------------------------------------------------------------
const LT_TO_EN_PARTS: Record<string, { type: string; wood: string }> = {
  'terasine-lenta-terasai': { type: 'terrace', wood: '' },
  'dailylente-fasadui': { type: 'facade', wood: '' },
};

const WOOD_LT_EN: Record<string, string> = {
  egle: 'spruce',
  maumedis: 'larch',
};

for (const [ltSlug, url] of Object.entries(PRODUCT_MODEL_MAP)) {
  // e.g. "degintos-medienos-terasine-lenta-terasai-egle-natural"
  for (const [ltPart, { type }] of Object.entries(LT_TO_EN_PARTS)) {
    if (!ltSlug.includes(ltPart)) continue;
    for (const [woodLt, woodEn] of Object.entries(WOOD_LT_EN)) {
      if (!ltSlug.includes(`-${woodLt}-`)) continue;
      // extract color from end: everything after the wood
      const colorMatch = ltSlug.match(new RegExp(`-${woodLt}-(.+)$`));
      if (!colorMatch) continue;
      const color = colorMatch[1];
      const enSlug = `shou-sugi-ban-for-${type}-${woodEn}-${color}`;
      if (!(enSlug in PRODUCT_MODEL_MAP)) {
        PRODUCT_MODEL_MAP[enSlug] = url;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Category + woodType combos → model path.
// Used when the slug doesn't have a direct mapping but we know the product's
// category and wood type (e.g. from Supabase product data).
// ---------------------------------------------------------------------------
const CATEGORY_WOOD_MODEL_MAP: Record<string, string> = {
  'facade-spruce': versioned('/models/products/spruce-facade.glb'),
  'terrace-spruce': versioned('/models/products/spruce-terrace.glb'),
  'facade-larch': versioned('/models/products/larch-facade.glb'),
  'terrace-larch': versioned('/models/products/larch-terrace.glb'),
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ProductModelOptions {
  /** Product slug (LT or EN). */
  slug?: string;
  /** Product category, e.g. "facade" | "terrace". */
  category?: string;
  /** Wood type, e.g. "spruce" | "larch". */
  woodType?: string;
}

/**
 * Resolve the best 3D model URL for a given product.
 *
 * Resolution order:
 * 1. Exact slug match in PRODUCT_MODEL_MAP
 * 2. Category + woodType combo match
 * 3. Generic fallback model
 */
export function getProductModelUrl(options: ProductModelOptions = {}): string {
  const { slug, category, woodType } = options;

  // 1. Try exact slug match
  if (slug && PRODUCT_MODEL_MAP[slug]) {
    return PRODUCT_MODEL_MAP[slug];
  }

  // 2. Try category + woodType combo
  if (category && woodType) {
    const key = `${category.toLowerCase()}-${woodType.toLowerCase()}`;
    if (CATEGORY_WOOD_MODEL_MAP[key]) {
      return CATEGORY_WOOD_MODEL_MAP[key];
    }
  }

  // 3. Fallback
  return FALLBACK_MODEL_URL;
}

/**
 * Get the fallback/generic model URL (used when no product context is available).
 */
export function getGenericModelUrl(): string {
  return FALLBACK_MODEL_URL;
}

/**
 * Check whether a per-product model is registered for the given slug.
 * Does NOT verify the file actually exists on disk (use HEAD check for that).
 */
export function hasProductModel(slug: string): boolean {
  return slug in PRODUCT_MODEL_MAP;
}

/**
 * Model version stamp — expose for preload link tags / cache headers.
 */
export const MODEL_CACHE_VERSION = MODEL_VERSION;
