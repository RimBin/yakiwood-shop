/**
 * Sanity GROQ Queries
 * Centralized location for all Sanity queries
 */

// Product list query with all necessary fields
export const PRODUCT_LIST_QUERY = `*[_type == "product"] | order(name asc) {
  _id,
  name,
  slug,
  description,
  basePrice,
  category,
  woodType,
  colors,
  finishes,
  inStock,
  "imageUrl": image.asset->url
}`;

// Single product query by slug
export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  slug,
  description,
  basePrice,
  category,
  woodType,
  colors,
  finishes,
  inStock,
  specifications,
  features,
  "imageUrl": image.asset->url,
  "images": images[].asset->url
}`;

// Featured products query
export const FEATURED_PRODUCTS_QUERY = `*[_type == "product" && featured == true] | order(_createdAt desc) [0...6] {
  _id,
  name,
  slug,
  description,
  basePrice,
  "imageUrl": image.asset->url
}`;
