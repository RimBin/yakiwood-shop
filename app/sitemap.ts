import { MetadataRoute } from 'next';
import { projects } from '@/data/projects';

const BASE_URL = 'https://yakiwood.lt';

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
  } catch (error) {
    console.warn('Supabase not available, using fallback products for sitemap');
  }

  return fallbackProducts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts();
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
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/projektai`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sprendimai`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/apie`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/kontaktai`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/duk`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic project pages
  const projectPages: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${BASE_URL}/projektai/${project.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...projectPages];
}
