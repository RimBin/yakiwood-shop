/**
 * JSON-LD Structured Data Generators for SEO
 * Use these functions to add structured data to pages for better search engine visibility
 */

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    '@type': 'PostalAddress';
    addressLocality: string;
    addressCountry: string;
  };
  contactPoint: {
    '@type': 'ContactPoint';
    contactType: string;
    availableLanguage: string[];
  };
  sameAs?: string[];
}

export interface ProductSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image?: string | string[];
  sku?: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: number;
    availability: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  category?: string;
  material?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }[];
}

const BASE_URL = 'https://yakiwood.lt';

/**
 * Generates Organization schema for Yakiwood company
 * Use this on the homepage or about page
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Yakiwood',
    url: BASE_URL,
    logo: `${BASE_URL}/images/yakiwood-logo.png`,
    description:
      'Yakiwood - aukščiausios kokybės deginta mediena. Shou Sugi Ban technologija fasadams, terasoms ir interjerui (pristatymas į Jungtinę Karalystę).',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Lithuanian', 'English'],
    },
    sameAs: [
      'https://www.facebook.com/yakiwood.europe',
      'https://www.instagram.com/yakiwood.eu',
      'https://www.linkedin.com/company/yakiwood/',
    ],
  };
}

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  image?: string;
  images?: string[];
  sku?: string;
  category?: string;
  woodType?: string;
  inStock?: boolean;
}

/**
 * Generates Product schema for a product page
 * @param product - Product data object
 */
export function generateProductSchema(product: ProductInput): ProductSchema {
  const productUrl = `${BASE_URL}/products/${product.slug}`;
  const productImages = product.images || (product.image ? [product.image] : []);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: productImages.length > 0 ? productImages : undefined,
    sku: product.sku || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Yakiwood',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'EUR',
      price: product.basePrice,
      availability:
        product.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Yakiwood',
      },
    },
    category: product.category,
    material: product.woodType ? `Deginta ${product.woodType} mediena` : 'Deginta mediena',
  };
}

/**
 * Generates BreadcrumbList schema for navigation
 * @param items - Array of breadcrumb items with name and url
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): BreadcrumbSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Helper function to render JSON-LD script tag content
 * Use this in a <script type="application/ld+json"> tag
 */
export function jsonLdScriptContent(
  schema: OrganizationSchema | ProductSchema | BreadcrumbSchema
): string {
  return JSON.stringify(schema);
}

/**
 * Example usage in a Next.js page:
 *
 * import { generateOrganizationSchema, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
 *
 * // In your page component:
 * const orgSchema = generateOrganizationSchema();
 * const breadcrumbs = generateBreadcrumbSchema([
 *   { name: 'Pagrindinis', url: '/' },
 *   { name: 'Produktai', url: '/products' },
 *   { name: 'Deginta eglė', url: '/products/burnt-spruce-cladding' }
 * ]);
 *
 * // In your JSX:
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
 * />
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
 * />
 */
