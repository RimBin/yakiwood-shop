import { DM_Sans, Outfit, Tiro_Tamil } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "./globals.css";
import AuthWrapper from '@/components/AuthWrapper';
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
