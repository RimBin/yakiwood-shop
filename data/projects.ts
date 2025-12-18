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
  {
    id: '4',
    slug: 'harmony-retreat-divi',
    title: 'Harmony retreat',
    subtitle: 'Divi',
    location: 'Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      'Harmony retreat Divi project featuring natural burnt wood elements',
    fullDescription:
      'A serene retreat space combining modern design with traditional Shou Sugi Ban burnt wood technique, creating a peaceful atmosphere for relaxation and wellness.',
    category: 'residential',
    featured: false,
  },
  {
    id: '5',
    slug: 'forestline-harmony-residences',
    title: 'Forestline Harmony Residences',
    location: 'Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Forestline Harmony Residences with natural wood aesthetics',
    fullDescription:
      'Residential complex harmoniously integrated with forest surroundings using premium burnt wood cladding. The natural texture and warmth of the wood create a perfect connection between architecture and nature.',
    category: 'residential',
    featured: false,
  },
  {
    id: '6',
    slug: 'nordic-driftwood-serenity',
    title: 'Nordic driftwood serenity',
    location: 'Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
    ],
    description:
      'Nordic-inspired design with driftwood aesthetics',
    fullDescription:
      'A tranquil space inspired by Nordic minimalism and natural driftwood textures, featuring burnt wood surfaces that evoke the weathered beauty of coastal landscapes.',
    category: 'residential',
    featured: false,
  },
  {
    id: '7',
    slug: 'nordic-coastline-living',
    title: 'Nordic coastline living',
    location: 'Lithuania',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      'Coastal living with Nordic design principles',
    fullDescription:
      'Modern coastal residence featuring weather-resistant burnt wood cladding inspired by Nordic architecture. The dark, protective finish provides durability while maintaining natural beauty.',
    category: 'residential',
    featured: false,
  },
  {
    id: '8',
    slug: 'modern-office',
    title: 'Modern office',
    location: 'Vilnius, Lithuania',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Contemporary office space with burnt wood accents',
    fullDescription:
      'A sophisticated office environment featuring burnt wood wall panels that create a warm, professional atmosphere. The natural wood elements promote creativity and well-being in the workplace.',
    category: 'commercial',
    featured: true,
  },
  {
    id: '9',
    slug: 'lilys-apartaments',
    title: "Lily's apartaments",
    location: 'Kaunas, Lithuania',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Elegant apartment complex with natural wood finishes',
    fullDescription:
      'Modern apartment building combining elegance with sustainability through the use of high-quality burnt wood cladding. The natural material provides excellent insulation and a timeless aesthetic.',
    category: 'residential',
    featured: false,
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
