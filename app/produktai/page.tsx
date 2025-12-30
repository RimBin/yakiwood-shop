import Products from '@/app/products/page';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

export const metadata: Metadata = {
  title: 'Products - Shou Sugi Ban Burnt Wood',
  description: 'Browse our collection of premium Shou Sugi Ban burnt wood products. Facades, panels, decking, and custom solutions with various finishes and colors.',
  openGraph: {
    title: 'Products - Yakiwood Shou Sugi Ban',
    description: 'Browse our collection of premium Shou Sugi Ban burnt wood products.',
    url: 'https://yakiwood.lt/produktai',
    images: [{ url: getOgImage('products'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [getOgImage('products')],
  },
};

export default Products;
