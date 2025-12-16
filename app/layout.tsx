import type { Metadata } from "next";
import { Suspense } from 'react';
import { DM_Sans, Outfit, Tiro_Tamil } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';
import { Header, Footer } from '@/components/shared';
import GoogleAnalytics from '@/components/GoogleAnalytics';

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
  title: "Yakiwood - Burnt Wood Specialists",
  description: "Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.",
  other: {
    'font-display': 'swap',
  },
};

// Export Web Vitals reporting
export { reportWebVitals } from '@/lib/monitoring/performance';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'en';
  return (
    <html lang={locale}>
      <body className={`${dmSans.variable} ${outfit.variable} ${tiroTamil.variable} antialiased bg-[#e1e1e1]`}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <NextIntlClientProvider locale={locale} messages={enMessages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
