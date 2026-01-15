/**
 * SEO Metadata Scanner
 * Scans the application to extract SEO metadata from all pages
 */

import type { Metadata } from 'next';
import { PageMetadata, validatePageMetadata } from './validator';

export interface PageSEOResult {
  path: string;
  title?: string;
  description?: string;
  url: string;
  openGraph?: PageMetadata['openGraph'];
  twitter?: PageMetadata['twitter'];
  seoScore: number;
  issues: Array<{
    field: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
  }>;
}

export interface PageInfo {
  path: string;
  file: string;
  metadata?: PageMetadata;
  hasMetadata: boolean;
  hasGenerateMetadata: boolean;
  priority?: number;
  changeFrequency?: string;
}

/**
 * Static page definitions
 * These are the main routes in the application
 */
export const STATIC_PAGES: Array<{
  path: string;
  file: string;
  priority: number;
  changeFrequency: string;
  description: string;
}> = [
  {
    path: '/',
    file: 'app/page.tsx',
    priority: 1.0,
    changeFrequency: 'weekly',
    description: 'Pagrindinis puslapis',
  },
  {
    path: '/produktai',
    file: 'app/produktai/page.tsx',
    priority: 0.9,
    changeFrequency: 'daily',
    description: 'Produktų sąrašas',
  },
  {
    path: '/sprendimai',
    file: 'app/sprendimai/page.tsx',
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Sprendimai',
  },
  {
    path: '/projektai',
    file: 'app/projektai/page.tsx',
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Projektų galerija',
  },
  {
    path: '/apie',
    file: 'app/about/page.tsx',
    priority: 0.7,
    changeFrequency: 'monthly',
    description: 'Apie mus',
  },
  {
    path: '/kontaktai',
    file: 'app/contact/page.tsx',
    priority: 0.7,
    changeFrequency: 'monthly',
    description: 'Kontaktai',
  },
  {
    path: '/faq',
    file: 'app/faq/page.tsx',
    priority: 0.6,
    changeFrequency: 'monthly',
    description: 'DUK',
  },
  {
    path: '/naujienos',
    file: 'app/naujienos/page.tsx',
    priority: 0.5,
    changeFrequency: 'weekly',
    description: 'Naujienlaiškis',
  },
  {
    path: '/account',
    file: 'app/account/page.tsx',
    priority: 0.3,
    changeFrequency: 'never',
    description: 'Paskyra (reikalauja prisijungimo)',
  },
  {
    path: '/login',
    file: 'app/login/page.tsx',
    priority: 0.4,
    changeFrequency: 'never',
    description: 'Prisijungimas',
  },
  {
    path: '/register',
    file: 'app/register/page.tsx',
    priority: 0.4,
    changeFrequency: 'never',
    description: 'Registracija',
  },
];

/**
 * Dynamic route patterns
 */
export const DYNAMIC_ROUTES = [
  {
    pattern: '/products/[slug]',
    file: 'app/products/[slug]/page.tsx',
    priority: 0.8,
    changeFrequency: 'weekly',
    description: 'Produkto detalės',
  },
  {
    pattern: '/projektai/[slug]',
    file: 'app/projektai/[slug]/page.tsx',
    priority: 0.7,
    changeFrequency: 'monthly',
    description: 'Projekto detalės',
  },
];

/**
 * Mock metadata extraction
 * In a real implementation, this would parse the actual page.tsx files
 * For now, we return mock data based on known implementations
 */
export async function extractMetadataFromPage(filePath: string, url: string): Promise<PageMetadata | null> {
  const baseUrl = 'https://yakiwood.lt';
  
  // Mock metadata based on file path
  const metadataMap: Record<string, PageMetadata> = {
    // Homepage - NO metadata currently
    'app/page.tsx': {
      url: `${baseUrl}/`,
      // title: undefined,
      // description: undefined,
    },

    // Produktai - NO metadata
    'app/produktai/page.tsx': {
      url: `${baseUrl}/produktai`,
    },

    // Sprendimai - NO metadata
    'app/sprendimai/page.tsx': {
      url: `${baseUrl}/sprendimai`,
    },

    // Projektai - NO metadata
    'app/projektai/page.tsx': {
      url: `${baseUrl}/projektai`,
    },

    // About - HAS basic metadata
    'app/about/page.tsx': {
      url: `${baseUrl}/apie`,
      title: 'Apie Yakiwood | Shou Sugi Ban Medienos Specialistai',
      description:
        'Sužinokite apie Yakiwood - Lietuvos lyderį Shou Sugi Ban (japoniškos degtos medienos) gamyboje. Mūsų istorija, vertybės ir komanda.',
    },

    // Contact - HAS basic metadata
    'app/contact/page.tsx': {
      url: `${baseUrl}/kontaktai`,
      title: 'Kontaktai | Yakiwood',
      description: 'Susisiekite su Yakiwood komanda. Atsakysime į Jūsų klausimus apie Shou Sugi Ban medieną ir projektus.',
    },

    // FAQ - HAS basic metadata
    'app/faq/page.tsx': {
      url: `${baseUrl}/faq`,
      title: 'DUK | Yakiwood',
      description: 'Dažniausiai užduodami klausimai apie Yakiwood produktus, Shou Sugi Ban medieną ir priežiūrą.',
    },

    // Product detail - HAS full metadata with OG and Twitter
    'app/products/[slug]/page.tsx': {
      url: `${baseUrl}/products/example-product`,
      title: 'Produkto Pavadinimas | Yakiwood',
      description: 'Aukštos kokybės Shou Sugi Ban mediena. Unikali japoniška degtos medienos apdorojimo technika.',
      openGraph: {
        title: 'Produkto Pavadinimas | Yakiwood',
        description: 'Aukštos kokybės Shou Sugi Ban mediena. Unikali japoniška degtos medienos apdorojimo technika.',
        type: 'product',
        siteName: 'Yakiwood',
        images: [
          {
            url: `${baseUrl}/og-image-product.jpg`,
            width: 1200,
            height: 630,
            alt: 'Produkto nuotrauka',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Produkto Pavadinimas | Yakiwood',
        description: 'Aukštos kokybės Shou Sugi Ban mediena.',
      },
    },

    // Project detail - HAS basic metadata
    'app/projektai/[slug]/page.tsx': {
      url: `${baseUrl}/projektai/example-project`,
      title: 'Projekto Pavadinimas | Yakiwood Projektai',
      description: 'Peržiūrėkite šį unikalų Yakiwood projektą naudojant Shou Sugi Ban medieną.',
    },

    // Account - HAS metadata
    'app/account/page.tsx': {
      url: `${baseUrl}/account`,
      title: 'Mano Paskyra | Yakiwood',
      description: 'Valdykite savo Yakiwood paskyrą, užsakymus ir nustatymus.',
      robots: {
        index: false,
        follow: false,
      },
    },

    // Login - NO metadata
    'app/login/page.tsx': {
      url: `${baseUrl}/login`,
      robots: {
        index: false,
        follow: true,
      },
    },

    // Register - NO metadata
    'app/register/page.tsx': {
      url: `${baseUrl}/register`,
      robots: {
        index: false,
        follow: true,
      },
    },

    // Newsletter - NO metadata
    'app/naujienos/page.tsx': {
      url: `${baseUrl}/naujienos`,
    },
  };

  return metadataMap[filePath] || { url };
}

/**
 * Scan all static pages and extract their metadata
 */
export async function scanStaticPages(): Promise<PageInfo[]> {
  const results: PageInfo[] = [];

  for (const page of STATIC_PAGES) {
    const metadata = await extractMetadataFromPage(page.file, page.path);
    
    results.push({
      path: page.path,
      file: page.file,
      metadata: metadata || undefined,
      hasMetadata: !!(metadata?.title || metadata?.description),
      hasGenerateMetadata: !!metadata,
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    });
  }

  return results;
}

/**
 * Scan dynamic routes
 */
export async function scanDynamicRoutes(): Promise<PageInfo[]> {
  const results: PageInfo[] = [];

  for (const route of DYNAMIC_ROUTES) {
    const metadata = await extractMetadataFromPage(route.file, route.pattern);
    
    results.push({
      path: route.pattern,
      file: route.file,
      metadata: metadata || undefined,
      hasMetadata: !!(metadata?.title || metadata?.description),
      hasGenerateMetadata: !!metadata,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    });
  }

  return results;
}

/**
 * Get all pages with their SEO status
 */
export async function getAllPages(): Promise<PageInfo[]> {
  const staticPages = await scanStaticPages();
  const dynamicPages = await scanDynamicRoutes();
  
  return [...staticPages, ...dynamicPages];
}

/**
 * Get pages with missing metadata
 */
export async function getPagesWithMissingMetadata(): Promise<PageInfo[]> {
  const allPages = await getAllPages();
  return allPages.filter((page) => !page.hasMetadata);
}

/**
 * Get pages with complete metadata
 */
export async function getPagesWithMetadata(): Promise<PageInfo[]> {
  const allPages = await getAllPages();
  return allPages.filter((page) => page.hasMetadata);
}

/**
 * Calculate overall SEO completeness percentage
 */
export async function calculateSEOCompleteness(): Promise<{
  total: number;
  withMetadata: number;
  withoutMetadata: number;
  percentage: number;
}> {
  const allPages = await getAllPages();
  const withMetadata = allPages.filter((p) => p.hasMetadata).length;
  const withoutMetadata = allPages.filter((p) => !p.hasMetadata).length;
  
  return {
    total: allPages.length,
    withMetadata,
    withoutMetadata,
    percentage: Math.round((withMetadata / allPages.length) * 100),
  };
}

/**
 * Scan all pages and return SEO validation results
 * This function validates metadata and calculates SEO scores for all pages
 */
export async function scanAllPages(): Promise<PageSEOResult[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yakiwood.lt';
  
  // For now, return mock data for all static pages
  // In a real implementation, this would read actual metadata from files
  const pages: PageSEOResult[] = STATIC_PAGES.map((page) => {
    const mockMetadata: PageMetadata = {
      url: `${baseUrl}${page.path}`,
      title: getMockTitle(page.path),
      description: getMockDescription(page.path),
      openGraph: {
        title: getMockTitle(page.path),
        description: getMockDescription(page.path),
        images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: getMockTitle(page.path),
        description: getMockDescription(page.path),
        images: ['/og-image.jpg'],
      },
    };

    const validation = validatePageMetadata(mockMetadata);

    return {
      path: page.path,
      title: mockMetadata.title,
      description: mockMetadata.description,
      url: mockMetadata.url,
      openGraph: mockMetadata.openGraph,
      twitter: mockMetadata.twitter,
      seoScore: validation.score,
      issues: validation.issues,
    };
  });

  return pages;
}

function getMockTitle(path: string): string {
  const titles: Record<string, string> = {
    '/': 'Yakiwood - Premium Shou Sugi Ban Burnt Wood Products',
    '/produktai': 'Products - Shou Sugi Ban Burnt Wood',
    '/sprendimai': 'Solutions - Shou Sugi Ban Applications',
    '/projektai': 'Projects - Shou Sugi Ban Showcase',
    '/apie': 'About Us - Yakiwood',
    '/kontaktai': 'Contact - Yakiwood',
    '/faq': 'FAQ - Frequently Asked Questions',
    '/naujienos': 'News & Updates - Yakiwood',
    '/login': 'Login - Yakiwood Account',
    '/register': 'Register - Create Yakiwood Account',
    '/account': 'My Account - Yakiwood',
    '/products/[slug]': 'Product Details - Yakiwood',
    '/projektai/[slug]': 'Project Details - Yakiwood',
  };
  return titles[path] || 'Yakiwood';
}

function getMockDescription(path: string): string {
  const descriptions: Record<string, string> = {
    '/': 'Discover premium Shou Sugi Ban burnt wood products delivered across the UK. Traditional Japanese charring technique for sustainable, durable, and beautiful wood facades and surfaces.',
    '/produktai': 'Browse our collection of premium Shou Sugi Ban burnt wood products. Facades, panels, decking, and custom solutions with various finishes and colors.',
    '/sprendimai': 'Explore our Shou Sugi Ban wood solutions for facades, interiors, terraces, and fences. Sustainable and beautiful architectural applications.',
    '/projektai': 'View our portfolio of completed Shou Sugi Ban projects. Get inspired by real-world applications of burnt wood in architecture and design.',
    '/apie': 'Learn about Yakiwood and our commitment to traditional Japanese Shou Sugi Ban techniques. Quality craftsmanship and sustainable wood products.',
    '/kontaktai': 'Get in touch with Yakiwood. Contact us for inquiries, quotes, or to discuss your burnt wood project requirements.',
    '/faq': 'Find answers to frequently asked questions about Shou Sugi Ban burnt wood products, installation, maintenance, and ordering.',
    '/naujienos': 'Latest news, projects, and updates from Yakiwood. Stay informed about new products, techniques, and Shou Sugi Ban innovations.',
    '/login': 'Sign in to your Yakiwood account to access your orders, saved projects, and account settings.',
    '/register': 'Create a Yakiwood account to save your projects, track orders, and get personalized recommendations.',
    '/account': 'Manage your Yakiwood account, view orders, saved projects, and account settings.',
    '/products/[slug]': 'View detailed information about this Shou Sugi Ban product including specifications, pricing, and ordering options.',
    '/projektai/[slug]': 'Explore this Shou Sugi Ban project showcase with photos, specifications, and implementation details.',
  };
  return descriptions[path] || 'Yakiwood - Premium Shou Sugi Ban burnt wood products delivered across the UK.';
}

