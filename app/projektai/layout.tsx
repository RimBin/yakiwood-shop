import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects - Shou Sugi Ban Showcase',
  description: 'View our portfolio of completed Shou Sugi Ban projects. Get inspired by real-world applications of burnt wood in architecture and design.',
  openGraph: {
    title: 'Projects - Yakiwood Shou Sugi Ban Showcase',
    description: 'View our portfolio of completed Shou Sugi Ban projects.',
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
