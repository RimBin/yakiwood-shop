import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projektai - Shou Sugi Ban Pavyzdžiai',
  description: 'Peržiūrėkite mūsų įgyvendintų Shou Sugi Ban projektų portfelį. Įkvėpkite realiais deginto medžio panaudojimais architektūroje ir dizaine.',
  openGraph: {
    title: 'Projektai - Yakiwood Shou Sugi Ban',
    description: 'Peržiūrėkite mūsų įgyvendintų Shou Sugi Ban projektų portfelį.',
    url: 'https://yakiwood.lt/projektai',
    images: [{ url: '/og-image-projects.jpg', width: 1200, height: 630 }],
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
