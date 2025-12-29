import Products from '@/app/products/page';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - Shou Sugi Ban Burnt Wood',
  description: 'Browse our collection of premium Shou Sugi Ban burnt wood products. Facades, panels, decking, and custom solutions with various finishes and colors.',
  openGraph: {
    title: 'Products - Yakiwood Shou Sugi Ban',
    description: 'Browse our collection of premium Shou Sugi Ban burnt wood products.',
    url: 'https://yakiwood.lt/produktai',
    images: [{ url: '/og-image-products.jpg', width: 1200, height: 630 }],
  },
};

export default Products;
