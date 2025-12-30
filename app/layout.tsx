import { DM_Sans, Outfit, Tiro_Tamil } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";
import AuthWrapper from '@/components/AuthWrapper';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import type { Metadata } from 'next';
import { getOgImage } from '@/lib/og-image';

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const tiroTamil = Tiro_Tamil({
  variable: "--font-tiro-tamil",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
  fallback: ["serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yakiwood.lt'),
  title: {
    template: '%s | Yakiwood',
    default: 'Yakiwood - Shou Sugi Ban Burnt Wood Specialists',
  },
  description: 'Premium Shou Sugi Ban burnt wood products in Lithuania. Traditional Japanese technique for sustainable, beautiful, and durable wood surfaces.',
  keywords: ['Shou Sugi Ban', 'burnt wood', 'yakisugi', 'charred wood', 'wood facades', 'sustainable wood', 'Lithuania'],
  authors: [{ name: 'Yakiwood' }],
  creator: 'Yakiwood',
  publisher: 'Yakiwood',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'lt_LT',
    url: 'https://yakiwood.lt',
    siteName: 'Yakiwood',
    title: 'Yakiwood - Shou Sugi Ban Burnt Wood Specialists',
    description: 'Premium Shou Sugi Ban burnt wood products in Lithuania. Traditional Japanese technique for sustainable, beautiful, and durable wood surfaces.',
    images: [
      {
        url: getOgImage('home'),
        width: 1200,
        height: 630,
        alt: 'Yakiwood - Shou Sugi Ban Burnt Wood',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yakiwood - Shou Sugi Ban Burnt Wood Specialists',
    description: 'Premium Shou Sugi Ban burnt wood products in Lithuania.',
    images: [getOgImage('home')],
    creator: '@yakiwood',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <html lang="lt">
      <body className={`${dmSans.variable} ${outfit.variable} ${tiroTamil.variable} antialiased bg-[#e1e1e1]`}>
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalytics />
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
