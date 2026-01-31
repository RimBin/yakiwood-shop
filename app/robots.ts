import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/*',
          '/admin/*',
          '/administravimas/*',
          '/account/*',
          '/studio/*',
          '/checkout',
          '/order-confirmation',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/lt/admin/*',
          '/lt/administravimas/*',
          '/lt/account/*',
          '/lt/studio/*',
          '/lt/checkout',
          '/lt/order-confirmation',
          '/lt/login',
          '/lt/register',
          '/lt/forgot-password',
          '/lt/reset-password',
        ],
      },
    ],
    sitemap: 'https://shop.yakiwood.co.uk/sitemap.xml',
  };
}
