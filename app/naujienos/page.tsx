import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News & Updates - Yakiwood',
  description: 'Latest news, projects, and updates from Yakiwood. Stay informed about new products, techniques, and Shou Sugi Ban innovations.',
  openGraph: {
    title: 'News & Updates - Yakiwood',
    description: 'Latest news, projects, and updates from Yakiwood.',
    url: 'https://yakiwood.lt/naujienos',
    images: [{ url: '/og-image-news.jpg', width: 1200, height: 630 }],
  },
};

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-['DM_Sans'] text-5xl font-light tracking-[-1.6px] text-[#161616] mb-12">
          News & Updates
        </h1>
        <div className="bg-white rounded-[24px] p-12 text-center">
          <p className="font-['Outfit'] text-lg text-[#535353]">
            News section coming soon. Stay tuned for updates on new products, projects, and innovations in Shou Sugi Ban wood.
          </p>
        </div>
      </div>
    </main>
  );
}
