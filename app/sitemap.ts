import { MetadataRoute } from 'next';
import { projects } from '@/data/projects';

const BASE_URL = 'https://shop.yakiwood.co.uk';

// Indexable variant landing pages (do not include preset/query URLs in sitemap)
const SHOU_SUGI_BAN_VARIANT_SLUGS = ['larch-carbon', 'spruce-natural', 'accoya-black'] as const;

// Fallback products data when Supabase is not available
const fallbackProducts = [
  { slug: 'burnt-spruce-cladding', updatedAt: new Date() },
  { slug: 'burnt-larch-decking', updatedAt: new Date() },
  { slug: 'burnt-pine-panels', updatedAt: new Date() },
  { slug: 'black-larch', updatedAt: new Date() },
  { slug: 'brown-larch', updatedAt: new Date() },
  { slug: 'carbon-larch', updatedAt: new Date() },
];

async function getProducts(): Promise<{ slug: string; updatedAt: Date }[]> {
  // Try to fetch from Supabase if available
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('products')
        .select('slug, updated_at')
        .eq('is_active', true);

      if (!error && data && data.length > 0) {
        return data.map((product) => ({
          slug: product.slug,
          updatedAt: new Date(product.updated_at || Date.now()),
        }));
      }
    }
  } catch {
    console.warn('Supabase not available, using fallback products for sitemap');
  }

  return fallbackProducts;
}

async function getSanityPages(): Promise<MetadataRoute.Sitemap> {
  try {
    // Import Sanity client if available in the project
    const { client } = await import('@/sanity/lib/client');
    const query = '*[_type in ["page","post","news"] && defined(slug.current)]{ "slug": slug.current, _updatedAt, _type }';
    const docs = await client.fetch(query);

    if (!docs || docs.length === 0) return [];

    return docs.flatMap((doc: any) => {
      const lastModified = doc._updatedAt ? new Date(doc._updatedAt) : new Date();
      const slug = doc.slug;

      // Map Sanity docs to both English and Lithuanian routes where applicable
      return [
        {
          url: `${BASE_URL}/${slug}`,
          lastModified,
          changeFrequency: 'monthly' as const,
          priority: 0.5,
        },
        {
          url: `${BASE_URL}/lt/${slug}`,
          lastModified,
          changeFrequency: 'monthly' as const,
          priority: 0.45,
        },
      ];
    });
  } catch (err) {
    console.warn('Sanity not available or query failed, skipping Sanity pages for sitemap');
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
  const sanityPages = await getSanityPages();
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/lt`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/lt/produktai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/lt/projektai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/solutions`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lt/sprendimai`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/lt/apie`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/lt/kontaktai`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/lt/duk`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/configurator3d`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/lt/konfiguratorius3d`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    // Add common legal/news pages that may be managed via CMS
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/lt/taisykles`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.25,
    },
    {
      url: `${BASE_URL}/lt/privatumas`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.25,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/lt/naujienos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.45,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products.flatMap((product) => {
    const enSlug = (product as any).slugEn ?? product.slug;
    return [
      {
        url: `${BASE_URL}/products/${enSlug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/lt/produktai/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      },
    ];
  });

  // Dynamic project pages
  const projectPages: MetadataRoute.Sitemap = projects.flatMap((project) => [
    {
      url: `${BASE_URL}/projects/${project.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lt/projektai/${project.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]);

  // Static SEO variant landing pages
  const variantLandingPages: MetadataRoute.Sitemap = SHOU_SUGI_BAN_VARIANT_SLUGS.flatMap((slug) => [
    {
      url: `${BASE_URL}/shou-sugi-ban/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/lt/shou-sugi-ban/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]);

  return [...staticPages, ...productPages, ...variantLandingPages, ...projectPages, ...sanityPages];
}
