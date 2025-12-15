import type { Metadata } from "next";
import { DM_Sans, Outfit, Tiro_Tamil } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';
import { Header, Footer } from '@/components/shared';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400"],
});

const tiroTamil = Tiro_Tamil({
  variable: "--font-tiro-tamil",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Yakiwood - Burnt Wood Specialists",
  description: "Discover the elegance and durability of burnt wood, crafted using the ancient Japanese Shou Sugi Ban technique.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = 'en';
  return (
    <html lang={locale}>
      <body className={`${dmSans.variable} ${outfit.variable} ${tiroTamil.variable} antialiased bg-[#e1e1e1]`}>
        <GoogleAnalytics />
        <NextIntlClientProvider locale={locale} messages={enMessages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
