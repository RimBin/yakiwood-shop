import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '1',
    slug: 'leliju-apartments',
    title: 'Lelijų Apartments',
    subtitle: 'Living home complex',
    location: 'Vilnius, Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Lelijų Apartments combine modern architecture with natural elements, featuring high-quality materials and sustainable design. Located in a peaceful neighborhood, they offer stylish living with a connection to nature.',
    fullDescription:
      'Lelijų Apartments are a perfect blend of contemporary design and organic aesthetics, offering a unique living experience in Lithuania. The architecture seamlessly integrates burnt wood elements with large glass facades, creating a striking yet harmonious contrast. Each apartment is designed with comfort and functionality in mind, providing ample natural light, spacious balconies, and high-quality finishes. Situated in a green and tranquil environment, the complex ensures a perfect balance between urban convenience and serene nature. Ideal for those seeking modern, stylish, and eco-conscious living.',
    featured: true,
    category: 'residential',
  },
  {
    id: '2',
    slug: 'modern-villa',
    title: 'Modern Villa',
    location: 'Kaunas, Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
    ],
    description:
      'A stunning modern villa showcasing the beauty of burnt wood in residential architecture.',
    category: 'residential',
  },
  {
    id: '3',
    slug: 'countryside-retreat',
    title: 'Countryside Retreat',
    location: 'Trakai, Lithuania',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      'A peaceful retreat in nature with elegant burnt wood facades.',
    category: 'residential',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProjects(currentSlug: string, limit = 3): Project[] {
  return projects
    .filter((project) => project.slug !== currentSlug)
    .slice(0, limit);
}
