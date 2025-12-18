// Add projects to localStorage via console or admin panel

const newProjects = [
  {
    id: Date.now().toString(),
    title: 'Harmony retreat',
    subtitle: 'Divi',
    slug: 'harmony-retreat-divi',
    location: 'Lithuania',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'],
    productsUsed: ['Black larch'],
    description: 'Harmony retreat Divi project featuring natural burnt wood elements',
    fullDescription: 'A serene retreat space combining modern design with traditional Shou Sugi Ban burnt wood technique, creating a peaceful atmosphere for relaxation and wellness.',
    category: 'residential',
    featured: false
  },
  {
    id: (Date.now() + 1).toString(),
    title: 'Forestline Harmony Residences',
    subtitle: '',
    slug: 'forestline-harmony-residences',
    location: 'Lithuania',
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'],
    productsUsed: ['Brown larch'],
    description: 'Forestline Harmony Residences with natural wood aesthetics',
    fullDescription: 'Residential complex harmoniously integrated with forest surroundings using premium burnt wood cladding. The natural texture and warmth of the wood create a perfect connection between architecture and nature.',
    category: 'residential',
    featured: false
  },
  {
    id: (Date.now() + 2).toString(),
    title: 'Nordic driftwood serenity',
    subtitle: '',
    slug: 'nordic-driftwood-serenity',
    location: 'Lithuania',
    images: ['https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80'],
    productsUsed: ['Carbon larch'],
    description: 'Nordic-inspired design with driftwood aesthetics',
    fullDescription: 'A tranquil space inspired by Nordic minimalism and natural driftwood textures, featuring burnt wood surfaces that evoke the weathered beauty of coastal landscapes.',
    category: 'residential',
    featured: false
  },
  {
    id: (Date.now() + 3).toString(),
    title: 'Nordic coastline living',
    subtitle: '',
    slug: 'nordic-coastline-living',
    location: 'Lithuania',
    images: ['https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80'],
    productsUsed: ['Black larch'],
    description: 'Coastal living with Nordic design principles',
    fullDescription: 'Modern coastal residence featuring weather-resistant burnt wood cladding inspired by Nordic architecture. The dark, protective finish provides durability while maintaining natural beauty.',
    category: 'residential',
    featured: false
  },
  {
    id: (Date.now() + 4).toString(),
    title: 'Modern office',
    subtitle: '',
    slug: 'modern-office',
    location: 'Vilnius, Lithuania',
    images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
    productsUsed: ['Carbon larch', 'Brown larch'],
    description: 'Contemporary office space with burnt wood accents',
    fullDescription: 'A sophisticated office environment featuring burnt wood wall panels that create a warm, professional atmosphere. The natural wood elements promote creativity and well-being in the workplace.',
    category: 'commercial',
    featured: true
  },
  {
    id: (Date.now() + 5).toString(),
    title: "Lily's apartaments",
    subtitle: '',
    slug: 'lilys-apartaments',
    location: 'Kaunas, Lithuania',
    images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'],
    productsUsed: ['Black larch', 'Brown larch'],
    description: 'Elegant apartment complex with natural wood finishes',
    fullDescription: 'Modern apartment building combining elegance with sustainability through the use of high-quality burnt wood cladding. The natural material provides excellent insulation and a timeless aesthetic.',
    category: 'residential',
    featured: false
  }
];

console.log('Projects to add:');
console.log(JSON.stringify(newProjects, null, 2));

console.log('\n\nTo add these projects to your admin panel:');
console.log('1. Open your browser console on the admin page (http://localhost:3000/admin)');
console.log('2. Run this code:\n');
console.log(`
const existingProjects = JSON.parse(localStorage.getItem('yakiwood_projects') || '[]');
const newProjects = ${JSON.stringify(newProjects, null, 2)};
const updatedProjects = [...existingProjects, ...newProjects];
localStorage.setItem('yakiwood_projects', JSON.stringify(updatedProjects));
console.log('Projects added successfully! Refresh the page.');
`);
