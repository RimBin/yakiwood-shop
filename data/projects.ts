import { Project } from '@/types/project';

export const projects: Project[] = [
  {
    id: '1',
    slug: 'leliju-apartments',
    title: 'Lelijų Apartments',
    subtitle: 'Gyvenamųjų namų kompleksas',
    location: 'Vilnius, Lietuva',
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
      'Lelijų Apartments sujungia modernią architektūrą ir natūralius akcentus: aukštos kokybės medžiagos, tvarūs sprendimai ir išraiškingas degintos medienos charakteris.',
    fullDescription:
      'Lelijų Apartments — šiuolaikiško dizaino ir organiškos estetikos dermė. Architektūroje degintos medienos plokštumos subtiliai kontrastuoja su dideliais stiklo fasadais, sukurdamos modernų, bet harmoningą įvaizdį. Butai projektuoti galvojant apie komfortą ir funkcionalumą: daug natūralios šviesos, erdvūs balkonai ir kokybiška apdaila. Kompleksas įsikūręs žalioje ir ramioje aplinkoje, todėl patogiai suderina miesto privalumus su gamtos artumu — puikus pasirinkimas ieškantiems stilingų ir ilgaamžių sprendimų.',
    i18n: {
      lt: {
        title: 'Lelijų Apartments',
        subtitle: 'Gyvenamųjų namų kompleksas',
        slug: 'leliju-apartments',
        location: 'Vilnius, Lietuva',
        description:
          'Lelijų Apartments sujungia modernią architektūrą ir natūralius akcentus: aukštos kokybės medžiagos, tvarūs sprendimai ir išraiškingas degintos medienos charakteris.',
        fullDescription:
          'Lelijų Apartments — šiuolaikiško dizaino ir organiškos estetikos dermė. Architektūroje degintos medienos plokštumos subtiliai kontrastuoja su dideliais stiklo fasadais, sukurdamos modernų, bet harmoningą įvaizdį. Butai projektuoti galvojant apie komfortą ir funkcionalumą: daug natūralios šviesos, erdvūs balkonai ir kokybiška apdaila. Kompleksas įsikūręs žalioje ir ramioje aplinkoje, todėl patogiai suderina miesto privalumus su gamtos artumu — puikus pasirinkimas ieškantiems stilingų ir ilgaamžių sprendimų.',
      },
      en: {
        title: 'Lelijų Apartments',
        subtitle: 'Living home complex',
        slug: 'leliju-apartments',
        location: 'Vilnius, Lithuania',
        description:
          'Lelijų Apartments combine modern architecture with natural elements, featuring high-quality materials and sustainable design. Located in a peaceful neighborhood, they offer stylish living with a connection to nature.',
        fullDescription:
          'Lelijų Apartments are a perfect blend of contemporary design and organic aesthetics, offering a unique living experience in Lithuania. The architecture seamlessly integrates burnt wood elements with large glass facades, creating a striking yet harmonious contrast. Each apartment is designed with comfort and functionality in mind, providing ample natural light, spacious balconies, and high-quality finishes. Situated in a green and tranquil environment, the complex ensures a perfect balance between urban convenience and serene nature. Ideal for those seeking modern, stylish, and eco-conscious living.',
      },
    },
    featured: true,
    category: 'residential',
  },
  {
    id: '2',
    slug: 'moderni-vila',
    title: 'Moderni vila',
    location: 'Kaunas, Lietuva',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
    ],
    description:
      'Įspūdinga moderni vila, kurioje deginta mediena išryškina fasado tekstūrą ir suteikia ilgaamžiškumo.',
    i18n: {
      lt: {
        title: 'Moderni vila',
        slug: 'moderni-vila',
        location: 'Kaunas, Lietuva',
        description:
          'Įspūdinga moderni vila, kurioje deginta mediena išryškina fasado tekstūrą ir suteikia ilgaamžiškumo.',
      },
      en: {
        title: 'Modern Villa',
        slug: 'modern-villa',
        location: 'Kaunas, Lithuania',
        description:
          'A stunning modern villa showcasing the beauty of burnt wood in residential architecture.',
      },
    },
    category: 'residential',
  },
  {
    id: '3',
    slug: 'uzmiescio-poilsio-namai',
    title: 'Užmiesčio poilsio namai',
    location: 'Trakai, Lietuva',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
      'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      'Ramus prieglobstis gamtoje su elegantišku degintos medienos fasadu.',
    i18n: {
      lt: {
        title: 'Užmiesčio poilsio namai',
        slug: 'uzmiescio-poilsio-namai',
        location: 'Trakai, Lietuva',
        description: 'Ramus prieglobstis gamtoje su elegantišku degintos medienos fasadu.',
      },
      en: {
        title: 'Countryside Retreat',
        slug: 'countryside-retreat',
        location: 'Trakai, Lithuania',
        description: 'A peaceful retreat in nature with elegant burnt wood facades.',
      },
    },
    category: 'residential',
  },
  {
    id: '4',
    slug: 'harmonijos-poilsis-divi',
    title: 'Harmonijos poilsis',
    subtitle: 'Divi',
    location: 'Lietuva',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      '„Harmonijos poilsis Divi“ projektas, kuriame deginta mediena tampa pagrindiniu natūraliu akcentu.',
    fullDescription:
      'Rami poilsio erdvė, sujungianti modernų dizainą su tradicine Shou Sugi Ban degintos medienos technika. Natūralios tekstūros ir tamsūs paviršiai kuria jaukią atmosferą atsipalaidavimui ir gerai savijautai.',
    i18n: {
      lt: {
        title: 'Harmonijos poilsis',
        subtitle: 'Divi',
        slug: 'harmonijos-poilsis-divi',
        location: 'Lietuva',
        description: '„Harmonijos poilsis Divi“ projektas, kuriame deginta mediena tampa pagrindiniu natūraliu akcentu.',
        fullDescription:
          'Rami poilsio erdvė, sujungianti modernų dizainą su tradicine Shou Sugi Ban degintos medienos technika. Natūralios tekstūros ir tamsūs paviršiai kuria jaukią atmosferą atsipalaidavimui ir gerai savijautai.',
      },
      en: {
        title: 'Harmony retreat',
        subtitle: 'Divi',
        slug: 'harmony-retreat-divi',
        location: 'Lithuania',
        description: 'Harmony retreat Divi project featuring natural burnt wood elements',
        fullDescription:
          'A serene retreat space combining modern design with traditional Shou Sugi Ban burnt wood technique, creating a peaceful atmosphere for relaxation and wellness.',
      },
    },
    category: 'residential',
    featured: false,
  },
  {
    id: '5',
    slug: 'forestline-harmonijos-rezidencijos',
    title: 'Forestline harmonijos rezidencijos',
    location: 'Lietuva',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      '„Forestline harmonijos rezidencijos“ — gyvenamasis kompleksas su natūralios medienos estetika ir degintos medienos apdaila.',
    fullDescription:
      'Gyvenamasis kompleksas harmoningai įsiliejęs į miško aplinką, naudojant premium degintos medienos fasadą. Natūrali tekstūra ir medienos šiluma sukuria tvirtą ryšį tarp architektūros ir gamtos.',
    i18n: {
      lt: {
        title: 'Forestline harmonijos rezidencijos',
        slug: 'forestline-harmonijos-rezidencijos',
        location: 'Lietuva',
        description:
          '„Forestline harmonijos rezidencijos“ — gyvenamasis kompleksas su natūralios medienos estetika ir degintos medienos apdaila.',
        fullDescription:
          'Gyvenamasis kompleksas harmoningai įsiliejęs į miško aplinką, naudojant aukščiausios kokybės degintos medienos fasadą. Natūrali tekstūra ir medienos šiluma sukuria tvirtą ryšį tarp architektūros ir gamtos.',
      },
      en: {
        title: 'Forestline Harmony Residences',
        slug: 'forestline-harmony-residences',
        location: 'Lithuania',
        description: 'Forestline Harmony Residences with natural wood aesthetics',
        fullDescription:
          'Residential complex harmoniously integrated with forest surroundings using premium burnt wood cladding. The natural texture and warmth of the wood create a perfect connection between architecture and nature.',
      },
    },
    category: 'residential',
    featured: false,
  },
  {
    id: '6',
    slug: 'siaurietiska-dreifmedzio-ramybe',
    title: 'Šiaurietiška dreifmedžio ramybė',
    location: 'Lietuva',
    images: [
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
    ],
    description:
      'Šiaurietiško minimalizmo įkvėptas dizainas su dreifmedžio estetika ir degintos medienos paviršiais.',
    fullDescription:
      'Rami erdvė, įkvėpta Šiaurės šalių minimalizmo ir natūralių dreifmedžio tekstūrų. Degintos medienos paviršiai primena pajūrio peizažų „išvėdintą“ grožį ir suteikia ilgaamžę apsaugą.',
    i18n: {
      lt: {
        title: 'Šiaurietiška dreifmedžio ramybė',
        slug: 'siaurietiska-dreifmedzio-ramybe',
        location: 'Lietuva',
        description:
          'Šiaurietiško minimalizmo įkvėptas dizainas su dreifmedžio estetika ir degintos medienos paviršiais.',
        fullDescription:
          'Rami erdvė, įkvėpta Šiaurės šalių minimalizmo ir natūralių dreifmedžio tekstūrų. Degintos medienos paviršiai primena pajūrio peizažų „išvėdintą“ grožį ir suteikia ilgaamžę apsaugą.',
      },
      en: {
        title: 'Nordic driftwood serenity',
        slug: 'nordic-driftwood-serenity',
        location: 'Lithuania',
        description: 'Nordic-inspired design with driftwood aesthetics',
        fullDescription:
          'A tranquil space inspired by Nordic minimalism and natural driftwood textures, featuring burnt wood surfaces that evoke the weathered beauty of coastal landscapes.',
      },
    },
    category: 'residential',
    featured: false,
  },
  {
    id: '7',
    slug: 'siaurietiskas-pajurio-gyvenimas',
    title: 'Šiaurietiškas pajūrio gyvenimas',
    location: 'Lietuva',
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
    ],
    description:
      'Pajūrio gyvenimo nuotaika ir Šiaurės šalių dizaino principai — su atspariu degintos medienos fasadu.',
    fullDescription:
      'Moderni pajūrio rezidencija su orui atspariu degintos medienos fasadu, įkvėptu Šiaurės šalių architektūros. Tamsi apsauginė apdaila suteikia ilgaamžiškumo ir išsaugo natūralų medienos grožį.',
    i18n: {
      lt: {
        title: 'Šiaurietiškas pajūrio gyvenimas',
        slug: 'siaurietiskas-pajurio-gyvenimas',
        location: 'Lietuva',
        description:
          'Pajūrio gyvenimo nuotaika ir Šiaurės šalių dizaino principai — su atspariu degintos medienos fasadu.',
        fullDescription:
          'Moderni pajūrio rezidencija su orui atspariu degintos medienos fasadu, įkvėptu Šiaurės šalių architektūros. Tamsi apsauginė apdaila suteikia ilgaamžiškumo ir išsaugo natūralų medienos grožį.',
      },
      en: {
        title: 'Nordic coastline living',
        slug: 'nordic-coastline-living',
        location: 'Lithuania',
        description: 'Coastal living with Nordic design principles',
        fullDescription:
          'Modern coastal residence featuring weather-resistant burnt wood cladding inspired by Nordic architecture. The dark, protective finish provides durability while maintaining natural beauty.',
      },
    },
    category: 'residential',
    featured: false,
  },
  {
    id: '8',
    slug: 'modernus-biuras',
    title: 'Modernus biuras',
    location: 'Vilnius, Lietuva',
    images: [
      '/images/ui/projects/imgProject4.jpg',
      '/images/ui/projects/imgProject2.jpg',
    ],
    productsUsed: [
      { name: 'Carbon larch', slug: 'carbon-larch' },
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Šiuolaikinė biuro erdvė su degintos medienos akcentais, kuriančiais šiltą ir profesionalų įvaizdį.',
    fullDescription:
      'Subtili biuro aplinka su degintos medienos sienų panelėmis, kurios suteikia jaukumo ir solidumo. Natūralūs medienos elementai padeda kurti gerą mikroklimatą ir skatina produktyvumą.',
    i18n: {
      lt: {
        title: 'Modernus biuras',
        slug: 'modernus-biuras',
        location: 'Vilnius, Lietuva',
        description:
          'Šiuolaikinė biuro erdvė su degintos medienos akcentais, kuriančiais šiltą ir profesionalų įvaizdį.',
        fullDescription:
          'Subtili biuro aplinka su degintos medienos sienų panelėmis, kurios suteikia jaukumo ir solidumo. Natūralūs medienos elementai padeda kurti gerą mikroklimatą ir skatina produktyvumą.',
      },
      en: {
        title: 'Modern office',
        slug: 'modern-office',
        location: 'Vilnius, Lithuania',
        description: 'Contemporary office space with burnt wood accents',
        fullDescription:
          'A sophisticated office environment featuring burnt wood wall panels that create a warm, professional atmosphere. The natural wood elements promote creativity and well-being in the workplace.',
      },
    },
    category: 'commercial',
    featured: true,
  },
  {
    id: '9',
    slug: 'lilys-apartamentai',
    title: 'Lily’s apartamentai',
    location: 'Kaunas, Lietuva',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    ],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
      { name: 'Brown larch', slug: 'brown-larch' },
    ],
    description:
      'Elegantiškas apartamentų kompleksas su natūralios medienos apdaila ir degintos medienos detalėmis.',
    fullDescription:
      'Modernus apartamentų pastatas, kuriame elegancija derinama su tvarumu pasitelkiant aukštos kokybės degintos medienos fasadą. Natūrali medžiaga suteikia gerą apsaugą ir laiko nepavaldžią estetiką.',
    i18n: {
      lt: {
        title: 'Lily’s apartamentai',
        slug: 'lilys-apartamentai',
        location: 'Kaunas, Lietuva',
        description:
          'Elegantiškas apartamentų kompleksas su natūralios medienos apdaila ir degintos medienos detalėmis.',
        fullDescription:
          'Modernus apartamentų pastatas, kuriame elegancija derinama su tvarumu pasitelkiant aukštos kokybės degintos medienos fasadą. Natūrali medžiaga suteikia gerą apsaugą ir laiko nepavaldžią estetiką.',
      },
      en: {
        title: "Lily's apartaments",
        slug: 'lilys-apartaments',
        location: 'Kaunas, Lithuania',
        description: 'Elegant apartment complex with natural wood finishes',
        fullDescription:
          'Modern apartment building combining elegance with sustainability through the use of high-quality burnt wood cladding. The natural material provides excellent insulation and a timeless aesthetic.',
      },
    },
    category: 'residential',
    featured: false,
  },
  {
    id: '10',
    slug: 'tamsaus-fasado-namas',
    title: 'Tamsaus fasado namas',
    subtitle: 'Shou Sugi Ban apdaila',
    location: 'Klaipėda, Lietuva',
    images: ['/images/ui/projects/imgProject6.jpg', '/images/ui/projects/imgProject5.jpg', '/images/ui/projects/imgProject1.jpg'],
    productsUsed: [
      { name: 'Black larch', slug: 'black-larch' },
      { name: 'Carbon larch', slug: 'carbon-larch' },
    ],
    description:
      'Privataus namo fasadas su matine degintos medienos apdaila – aiškios linijos, gili tekstūra ir ilgaamžė apsauga nuo aplinkos poveikio.',
    fullDescription:
      'Šiame projekte pasirinkta Shou Sugi Ban technika padėjo sukurti išraiškingą, tačiau santūrų fasadą. Deginta mediena suteikia natūralią UV ir drėgmės apsaugą, o matinis paviršius gražiai „sugeria“ šviesą ir dera su modernia architektūra. Sprendimas parinktas taip, kad būtų lengva prižiūrėti ir ilgai išlaikytų vienodą estetiką Lietuvos klimato sąlygomis.',
    i18n: {
      lt: {
        title: 'Tamsaus fasado namas',
        subtitle: 'Shou Sugi Ban apdaila',
        slug: 'tamsaus-fasado-namas',
        location: 'Klaipėda, Lietuva',
        description:
          'Privataus namo fasadas su matine degintos medienos apdaila – aiškios linijos, gili tekstūra ir ilgaamžė apsauga nuo aplinkos poveikio.',
        fullDescription:
          'Šiame projekte pasirinkta Shou Sugi Ban technika padėjo sukurti išraiškingą, tačiau santūrų fasadą. Deginta mediena suteikia natūralią UV ir drėgmės apsaugą, o matinis paviršius gražiai „sugeria“ šviesą ir dera su modernia architektūra. Sprendimas parinktas taip, kad būtų lengva prižiūrėti ir ilgai išlaikytų vienodą estetiką Lietuvos klimato sąlygomis.',
      },
      en: {
        title: 'Dark facade house',
        subtitle: 'Shou Sugi Ban cladding',
        slug: 'dark-facade-house',
        location: 'Klaipėda, Lithuania',
        description:
          'Private house facade finished with matte burnt wood cladding – clean lines, deep texture, and long-lasting protection against the elements.',
        fullDescription:
          'In this project, the Shou Sugi Ban technique was used to create a distinctive yet minimal facade. Burnt wood provides natural UV and moisture resistance, while the matte surface absorbs light beautifully and complements modern architecture. The system was selected for easy maintenance and consistent aesthetics in Lithuania’s climate.',
      },
    },
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
