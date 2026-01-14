import { assets } from '@/lib/assets';

export type BlogLocale = 'lt' | 'en';

export type BlogPost = {
  id: string;
  slug: Record<BlogLocale, string>;
  title: Record<BlogLocale, string>;
  excerpt: Record<BlogLocale, string>;
  summary: Record<BlogLocale, string>;
  sections: Array<{
    heading: Record<BlogLocale, string>;
    body: Record<BlogLocale, string>;
  }>;
  body: Record<BlogLocale, string[]>;
  callout: Record<BlogLocale, string>;
  closing: Record<BlogLocale, string>;
  heroImage: string;
  gallery: string[];
  featureImages: string[];
  author: string;
  date: string;
  category: Record<BlogLocale, string>;
  published: boolean;
  readTimeMinutes: number;
};

export type LocalizedBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  summary: string;
  sections: Array<{ heading: string; body: string }>;
  body: string[];
  callout: string;
  closing: string;
  heroImage: string;
  gallery: string[];
  featureImages: string[];
  author: string;
  date: string;
  category: string;
  published: boolean;
  readTimeMinutes: number;
};

export const blogPosts: BlogPost[] = [
  {
    id: 'burnt-wood-architecture',
    slug: {
      lt: 'deginta-mediena-fasadui-ir-terasai',
      en: 'charred-wood-for-facades-and-terraces',
    },
    title: {
      lt: 'Degintos medienos menas: fasadui, terasai ir interjerui',
      en: 'The Art of Burning: Charred Wood for Facades, Terraces, and Interiors',
    },
    excerpt: {
      lt: 'Shou Sugi Ban sujungia estetiką ir apsaugą. Šis straipsnis parodo, kaip deginta mediena suteikia charakterio ir ilgaamžiškumo tiek moderniems, tiek klasikiniams projektams.',
      en: 'Shou Sugi Ban blends aesthetics with protection. This article shows how charred wood adds character and durability to both modern and classic projects.',
    },
    summary: {
      lt: 'Deginta mediena nėra vien tik išvaizda. Tinkamai apdorotas paviršius tampa atsparesnis drėgmei, UV spinduliams ir kenkėjams, todėl fasadai bei terasos ilgiau išlaiko tvirtumą.',
      en: 'Charred wood is not just about looks. Properly treated surfaces become more resistant to moisture, UV exposure, and pests, so facades and terraces keep their strength longer.',
    },
    sections: [
      {
        heading: {
          lt: 'Kodėl ši technologija veikia',
          en: 'Why This Technique Works',
        },
        body: {
          lt: 'Apdeginimas uždaro medienos poras, o paviršius tampa tankesnis. Tai sumažina vandens įsigėrimą ir palengvina priežiūrą.',
          en: 'Charring closes the wood pores and densifies the surface. This reduces water absorption and simplifies maintenance.',
        },
      },
      {
        heading: {
          lt: 'Kur ji atsiskleidžia geriausiai',
          en: 'Where It Shines Most',
        },
        body: {
          lt: 'Ventiliuojami fasadai, terasos, akcentinės sienos ir detalės, kur svarbus gylis, tekstūra bei kontrastas.',
          en: 'Ventilated facades, terraces, feature walls, and details where depth, texture, and contrast matter.',
        },
      },
      {
        heading: {
          lt: 'Užsakymo patarimai',
          en: 'Ordering Tips',
        },
        body: {
          lt: 'Pasidalinkite projekto vieta, norimu profiliu ir spalvos nuorodomis. Tai leidžia pasiūlyti optimalų sprendimą ir kainą.',
          en: 'Share the project location, preferred profile, and color references. This helps us propose the best solution and pricing.',
        },
      },
    ],
    body: {
      lt: [
        'Deginta mediena suteikia architektūrai solidumo: tamsūs tonai išryškina formas, o šukuota tekstūra pabrėžia natūralią kilmę. Dėl to ji tinka tiek minimalistinėms, tiek tradicinėms kompozicijoms.',
        'Renkantis apdailą verta įvertinti ekspoziciją saulėje ir drėgmę. Stipriai apdegintos lentos bus tamsesnės, o švelniai degintos – subtiliai rusvos.',
        'Jei norite unikalios estetikos, derinkite skirtingus profilius ar kryptis. Tai sukuria ritmą ir išskirtinį šešėlių žaismą.',
      ],
      en: [
        'Charred wood gives architecture a sense of weight: dark tones emphasize form, while brushed textures highlight its natural origin. It fits both minimalist and traditional compositions.',
        'When choosing a finish, consider sun exposure and moisture. Heavily charred boards are darker, while lightly charred ones read warmer and softer.',
        'If you want a unique aesthetic, mix profiles or orientations. This creates rhythm and distinctive shadow play.',
      ],
    },
    callout: {
      lt: 'Deginta mediena yra vienas iš nedaugelio apdailos sprendimų, kuris vienu metu atrodo moderniai ir ilgaamžiškai.',
      en: 'Charred wood is one of the few finishes that feels both modern and timeless at once.',
    },
    closing: {
      lt: 'Norite pritaikyti degintą medieną savo projekte? Parašykite mums – paruošime pavyzdžius ir pasiūlymą.',
      en: 'Ready to use charred wood in your project? Contact us for samples and a tailored offer.',
    },
    heroImage: assets.projects[0],
    gallery: [assets.categories.facades, assets.categories.terrace],
    featureImages: [assets.projects[1], assets.projects[2]],
    author: 'Yakiwood',
    date: '2024-11-05',
    category: { lt: 'Dizainas', en: 'Design' },
    published: true,
    readTimeMinutes: 5,
  },
  {
    id: 'yakisugi-vs-thermowood',
    slug: {
      lt: 'yakisugi-vs-termomediena',
      en: 'yakisugi-vs-thermowood',
    },
    title: {
      lt: 'Yakisugi ir termomediena: ką rinktis fasadui?',
      en: 'Yakisugi vs Thermowood: Which Facade Wins?',
    },
    excerpt: {
      lt: 'Dvi populiariausios fasadų technologijos turi skirtingus privalumus. Palyginame atsparumą, priežiūrą ir estetiką.',
      en: 'Two leading facade technologies offer different benefits. We compare durability, maintenance, and aesthetics.',
    },
    summary: {
      lt: 'Termomediena stabilizuoja plaušą karščiu, o Yakisugi sukuria apsauginį anglies sluoksnį. Abi technologijos prailgina tarnavimo laiką, bet vizualus efektas skiriasi.',
      en: 'Thermowood stabilizes fibers with heat, while Yakisugi creates a protective carbon layer. Both extend lifespan, but the visual effect differs.',
    },
    sections: [
      {
        heading: {
          lt: 'Atsparumas ir ilgaamžiškumas',
          en: 'Durability and Lifespan',
        },
        body: {
          lt: 'Yakisugi yra natūraliai atsparus ugniai ir UV, o termomediena gerai elgiasi drėgnose zonose. Sprendimą lemia ekspozicija.',
          en: 'Yakisugi resists fire and UV naturally, while thermowood performs well in humid zones. Exposure conditions should drive the decision.',
        },
      },
      {
        heading: {
          lt: 'Estetika ir tekstūra',
          en: 'Aesthetics and Texture',
        },
        body: {
          lt: 'Yakisugi suteikia gilią juodą tekstūrą, termomediena – šiltą karamelinį atspalvį. Abu variantai gali būti alyvuojami.',
          en: 'Yakisugi offers a deep black texture, thermowood leans warm caramel. Both can be oiled for extra protection.',
        },
      },
      {
        heading: {
          lt: 'Kaina ir priežiūra',
          en: 'Cost and Maintenance',
        },
        body: {
          lt: 'Termomediena dažnai pigesnė, tačiau Yakisugi reikalauja mažiau atnaujinimų. Skaičiuokite viso gyvenimo ciklo kainą.',
          en: 'Thermowood is often cheaper, while Yakisugi needs fewer refresh cycles. Compare lifecycle cost, not just the initial budget.',
        },
      },
    ],
    body: {
      lt: [
        'Svarbiausia – aiškiai įvardyti, ko tikitės: dramatiškos estetikos ar šiltesnio tono. Yakisugi labiau tinka, kai norite išskirtinio charakterio.',
        'Jei fasadas bus pietinėje pusėje ar pajūryje, apdailos atnaujinimo grafikas tampa svarbus. Yakisugi dažniausiai išlaiko spalvą ilgiau.',
        'Renkantis medienos rūšį (eglė, maumedis), įvertinkite ir profilio pasirinkimą – skirtingi profiliai keičia vizualų efektą.',
      ],
      en: [
        'First define the goal: bold contrast or warm natural tone. Yakisugi is the choice when you want an unmistakable character.',
        'For south-facing or coastal facades, maintenance schedules matter. Yakisugi typically holds its tone longer.',
        'When selecting species (spruce or larch), consider profile options too. Profiles change the overall visual rhythm.',
      ],
    },
    callout: {
      lt: 'Jei siekiate išskirtinės estetikos ir mažesnės priežiūros, Yakisugi dažnai tampa racionalia investicija.',
      en: 'If you want standout aesthetics and lower maintenance, Yakisugi often becomes the smarter investment.',
    },
    closing: {
      lt: 'Reikia palyginimo jūsų projektui? Atsiųskite fasado vizualus – paruošime rekomendaciją.',
      en: 'Need a comparison for your project? Share your facade visuals and we will recommend the best fit.',
    },
    heroImage: assets.projects[3],
    gallery: [assets.categories.facades, assets.categories.interior],
    featureImages: [assets.projects[4], assets.projects[5]],
    author: 'Yakiwood',
    date: '2024-11-12',
    category: { lt: 'Medžiagos', en: 'Materials' },
    published: true,
    readTimeMinutes: 6,
  },
  {
    id: 'facade-rhythm',
    slug: {
      lt: 'fasado-profiliai-ir-ritmas',
      en: 'facade-profiles-and-rhythm',
    },
    title: {
      lt: 'Fasado profiliai ir ritmas: kaip pasirinkti',
      en: 'Facade Profiles and Rhythm: How to Choose',
    },
    excerpt: {
      lt: 'Profilio pasirinkimas keičia fasado charakterį. Dalinamės patarimais, kaip sukurti vientisą ritmą ir modernų siluetą.',
      en: 'Profile choice changes the character of a facade. We share tips on creating rhythm and a modern silhouette.',
    },
    summary: {
      lt: 'Profilis lemia šviesos ir šešėlių žaismą. Plokšti profiliai kuria ramų vaizdą, o reljefiniai – gilesnį kontrastą.',
      en: 'Profiles drive light and shadow interplay. Flat profiles feel calm, while textured ones deliver deeper contrast.',
    },
    sections: [
      {
        heading: {
          lt: 'Plokščias ar reljefinis?',
          en: 'Flat or Textured?',
        },
        body: {
          lt: 'Plokštuma tinka minimalistinei architektūrai, o reljefas – kai norite daugiau vizualios energijos.',
          en: 'Flat profiles suit minimalism, while textured options add visual energy.',
        },
      },
      {
        heading: {
          lt: 'Horizontalus ar vertikalus montavimas',
          en: 'Horizontal vs Vertical',
        },
        body: {
          lt: 'Horizontaliai montuotos lentos vizualiai praplečia pastatą, vertikaliai – pailgina.',
          en: 'Horizontal boards widen the building, vertical boards make it feel taller.',
        },
      },
      {
        heading: {
          lt: 'Ritmo taisyklė',
          en: 'The Rhythm Rule',
        },
        body: {
          lt: 'Derinkite lentų plotį su langų moduliu. Taip fasadas atrodys tvarkingas net ir iš arti.',
          en: 'Align board widths with window modules. The facade will look cohesive even up close.',
        },
      },
    ],
    body: {
      lt: [
        'Profilio pasirinkimą verta daryti kartu su architektu. Kartais pakanka nedidelės tekstūros, kad pastatas atrodytų prabangesnis.',
        'Svarbu ir montavimo kryptis – ji daro įtaką vizualiam pastato masteliui. Tai ypač aktualu mažesniems namams.',
        'Jei abejojate, rekomenduojame išbandyti kelis profilius ant realaus pavyzdžio. Taip sprendimas bus tikslus.',
      ],
      en: [
        'Profile choices are best made with the architect. A subtle texture can elevate a facade instantly.',
        'Orientation also affects perceived scale, especially for smaller buildings.',
        'If you are unsure, test several profiles on real samples before deciding.',
      ],
    },
    callout: {
      lt: 'Ritmas nėra detalė – jis sukuria viso fasado nuotaiką.',
      en: 'Rhythm is not a detail—it sets the mood of the entire facade.',
    },
    closing: {
      lt: 'Norite profilių pavyzdžių? Parašykite, ir atsiųsime skirtingas tekstūras palyginimui.',
      en: 'Need profile samples? Contact us and we will send multiple textures to compare.',
    },
    heroImage: assets.projects[2],
    gallery: [assets.categories.facades, assets.projects[1]],
    featureImages: [assets.projects[0], assets.projects[4]],
    author: 'Yakiwood',
    date: '2024-11-20',
    category: { lt: 'Architektūra', en: 'Architecture' },
    published: true,
    readTimeMinutes: 5,
  },
  {
    id: 'maintenance-plan',
    slug: {
      lt: 'degintos-medienos-prieziura',
      en: 'charred-wood-maintenance-plan',
    },
    title: {
      lt: 'Degintos medienos priežiūros planas: aiškiai ir paprastai',
      en: 'Charred Wood Maintenance Plan: Clear and Simple',
    },
    excerpt: {
      lt: 'Tinkama priežiūra prailgina fasado tarnavimo laiką. Štai kada plauti, kada alyvuoti, ir ko vengti.',
      en: 'Proper care extends facade lifespan. Here is when to clean, when to oil, and what to avoid.',
    },
    summary: {
      lt: 'Daugeliu atvejų pakanka sezoninio nuplovimo ir paviršiaus patikros. Alyvuoti reikia tik tada, kai spalva pradeda blukti.',
      en: 'In most cases, seasonal rinsing and surface inspection is enough. Oil only when the color starts fading.',
    },
    sections: [
      {
        heading: {
          lt: 'Kasdienė priežiūra',
          en: 'Routine Care',
        },
        body: {
          lt: 'Švelnus vandens srautas ir minkštas šepetys – to visiškai pakanka. Venkite aukšto slėgio plovimo.',
          en: 'A gentle rinse and a soft brush are enough. Avoid high-pressure washing.',
        },
      },
      {
        heading: {
          lt: 'Alyvos atnaujinimas',
          en: 'Oil Refresh',
        },
        body: {
          lt: 'Alyvą atnaujinkite kas 2–5 metus, priklausomai nuo fasado orientacijos.',
          en: 'Refresh oil every 2–5 years depending on facade orientation.',
        },
      },
      {
        heading: {
          lt: 'Klaidos, kurios kainuoja',
          en: 'Costly Mistakes',
        },
        body: {
          lt: 'Netinkami valikliai ar per stiprus šveitimas gali pažeisti anglies sluoksnį.',
          en: 'Harsh cleaners or aggressive scrubbing can damage the charred layer.',
        },
      },
    ],
    body: {
      lt: [
        'Pirmus metus rekomenduojame stebėti spalvos pokytį. Tai padeda laiku suplanuoti pirmąjį atnaujinimą.',
        'Jei fasadas yra šalia medžių, kartą per metus nuplaukite paviršių nuo dervų ar organinių apnašų.',
        'Turėdami aiškų planą, fasadą prižiūrėsite greitai ir be papildomų išlaidų.',
      ],
      en: [
        'During the first year, observe color changes. This helps plan the first refresh.',
        'If the facade is close to trees, rinse it once a year to remove resin or organic buildup.',
        'With a clear plan, upkeep is quick and cost-effective.',
      ],
    },
    callout: {
      lt: 'Maža priežiūra šiandien – didelis sutaupymas po penkerių metų.',
      en: 'Small care today means big savings five years from now.',
    },
    closing: {
      lt: 'Reikia individualaus priežiūros plano? Pateikite projekto vietą ir apdailos tipą.',
      en: 'Need a custom maintenance plan? Share your location and finish type.',
    },
    heroImage: assets.projects[5],
    gallery: [assets.categories.interior, assets.categories.facades],
    featureImages: [assets.projects[1], assets.projects[3]],
    author: 'Yakiwood',
    date: '2024-12-03',
    category: { lt: 'Priežiūra', en: 'Maintenance' },
    published: true,
    readTimeMinutes: 4,
  },
  {
    id: 'terrace-performance',
    slug: {
      lt: 'terasa-is-degintos-medienos',
      en: 'charred-wood-terraces',
    },
    title: {
      lt: 'Terasa iš degintos medienos: patvarumas ir saugumas',
      en: 'Charred Wood Terraces: Durability and Safety',
    },
    excerpt: {
      lt: 'Degintos medienos terasa atspari orui, maloni liesti ir išlaiko stabilią spalvą. Sužinokite, kaip išsirinkti tinkamą profilį.',
      en: 'A charred wood terrace resists weather, feels great underfoot, and keeps stable color. Learn how to choose the right profile.',
    },
    summary: {
      lt: 'Terasoms svarbu atsparumas drėgmei ir neslystantis paviršius. Yakisugi paviršius po šukavimo tampa malonus ir saugus.',
      en: 'For terraces, moisture resistance and slip safety matter most. Brushed Yakisugi is comfortable and safe.',
    },
    sections: [
      {
        heading: {
          lt: 'Slydimo rizikos mažinimas',
          en: 'Reducing Slip Risk',
        },
        body: {
          lt: 'Rinkitės profilius su faktūra. Jie geriau išlaiko sukibimą drėgnomis dienomis.',
          en: 'Choose textured profiles. They improve grip on wet days.',
        },
      },
      {
        heading: {
          lt: 'Stabilumas visais sezonais',
          en: 'Seasonal Stability',
        },
        body: {
          lt: 'Apdorota mediena mažiau plečiasi ir susitraukia. Tai reiškia mažiau tarpų ir deformacijų.',
          en: 'Treated wood expands and contracts less, reducing gaps and deformation.',
        },
      },
      {
        heading: {
          lt: 'Ilgalaikė estetika',
          en: 'Long-Term Aesthetics',
        },
        body: {
          lt: 'Tamsus tonas su laiku išlieka sodrus, ypač jei periodiškai atnaujinate alyvą.',
          en: 'Dark tones remain rich, especially with periodic oil refresh.',
        },
      },
    ],
    body: {
      lt: [
        'Prieš montuojant terasą verta paruošti tvirtą pagrindą ir gerą ventiliaciją. Tai sumažina drėgmės kaupimąsi.',
        'Terasoms dažnai rekomenduojame maumedį dėl natūralaus tankio ir ilgaamžiškumo.',
        'Norėdami ilgesnio tarnavimo, rinkitės nerūdijančio plieno tvirtinimo elementus.',
      ],
      en: [
        'Before installation, ensure a solid substructure and proper ventilation. This limits moisture buildup.',
        'For terraces we often recommend larch for its density and durability.',
        'Use stainless steel fasteners for maximum service life.',
      ],
    },
    callout: {
      lt: 'Tinkamai sumontuota degintos medienos terasa tarnauja ilgiau nei įprasta impregnuota mediena.',
      en: 'A properly installed charred wood terrace can outlast typical treated decking.',
    },
    closing: {
      lt: 'Planuojate terasą? Padėsime išsirinkti profilį ir pateiksime pasiūlymą.',
      en: 'Planning a terrace? We will help select the profile and prepare a quote.',
    },
    heroImage: assets.categories.terrace,
    gallery: [assets.projects[4], assets.projects[0]],
    featureImages: [assets.projects[2], assets.projects[5]],
    author: 'Yakiwood',
    date: '2024-12-14',
    category: { lt: 'Terasa', en: 'Terrace' },
    published: true,
    readTimeMinutes: 5,
  },
  {
    id: 'interior-accents',
    slug: {
      lt: 'degintos-medienos-interjere',
      en: 'charred-wood-interior-accents',
    },
    title: {
      lt: 'Deginta mediena interjere: akcentinė siena be kompromisų',
      en: 'Charred Wood Interiors: A Feature Wall Without Compromise',
    },
    excerpt: {
      lt: 'Interjere deginta mediena kuria jaukumą, gylį ir tekstūrą. Paaiškiname, kaip išvengti rub-off ir kaip parinkti apdailą.',
      en: 'Charred wood interiors deliver warmth, depth, and texture. Learn how to avoid rub-off and pick the right finish.',
    },
    summary: {
      lt: 'Vidaus erdvėse svarbiausia švara ir komfortas. Tinkamai alyvuotas paviršius netepa ir lengvai valomas.',
      en: 'Indoors, cleanliness and comfort come first. A properly oiled surface does not rub off and is easy to clean.',
    },
    sections: [
      {
        heading: {
          lt: 'Kur tinka geriausiai',
          en: 'Best Use Cases',
        },
        body: {
          lt: 'Svetainės sienos, laiptinės, restoranai ar biurai – ten, kur norite stipraus akcento.',
          en: 'Living rooms, staircases, restaurants, or offices—anywhere a strong accent is needed.',
        },
      },
      {
        heading: {
          lt: 'Spalvos pasirinkimas',
          en: 'Choosing the Tone',
        },
        body: {
          lt: 'Tamsūs tonai suteikia dramatizmo, o švelnesni – natūralaus jaukumo.',
          en: 'Dark tones feel dramatic, while softer shades feel natural and warm.',
        },
      },
      {
        heading: {
          lt: 'Montavimo niuansai',
          en: 'Installation Details',
        },
        body: {
          lt: 'Vidaus montavimui svarbu lygus pagrindas ir tikslus sujungimas – tai išryškina tekstūrą.',
          en: 'Indoor installations need a flat substrate and precise joints to highlight texture.',
        },
      },
    ],
    body: {
      lt: [
        'Jei norite minkštesnio efekto, rinkitės alyvuotą arba švelniai šukuotą paviršių.',
        'Vidaus erdvėse dažnai naudojame siauresnius profilius, kad tekstūra atrodytų subtiliau.',
        'Norint išlaikyti vientisumą, rekomenduojame užsakyti vienos partijos medieną.',
      ],
      en: [
        'For a softer feel, choose oiled or lightly brushed surfaces.',
        'Indoors, narrower profiles often look more refined.',
        'To keep the finish consistent, order from a single batch.',
      ],
    },
    callout: {
      lt: 'Interjero akcentas turi būti ir gražus, ir praktiškas. Deginta mediena leidžia turėti abu.',
      en: 'An interior accent should be both beautiful and practical. Charred wood delivers both.',
    },
    closing: {
      lt: 'Svarstote akcentinę sieną? Pateiksime tinkamas tekstūras ir spalvų pavyzdžius.',
      en: 'Considering a feature wall? We can provide textures and color samples.',
    },
    heroImage: assets.categories.interior,
    gallery: [assets.projects[5], assets.projects[1]],
    featureImages: [assets.projects[3], assets.projects[0]],
    author: 'Yakiwood',
    date: '2024-12-22',
    category: { lt: 'Interjeras', en: 'Interior' },
    published: true,
    readTimeMinutes: 4,
  },
  {
    id: 'sustainable-choice',
    slug: {
      lt: 'tvari-degintos-medienos-apdaila',
      en: 'sustainable-charred-wood-cladding',
    },
    title: {
      lt: 'Tvarus pasirinkimas: kodėl Shou Sugi Ban ekologiška',
      en: 'Sustainable Choice: Why Shou Sugi Ban Is Eco-Friendly',
    },
    excerpt: {
      lt: 'Be cheminių impregnantų ir su ilgu tarnavimo laiku – deginta mediena atitinka tvarumo principus.',
      en: 'No harsh chemicals and long service life—charred wood matches sustainability goals.',
    },
    summary: {
      lt: 'Deginimas yra natūralus apsaugos būdas. Jis sumažina poreikį dažnai atnaujinti paviršių ir mažina atliekų kiekį.',
      en: 'Charring is a natural protection method. It reduces frequent refinishing and lowers overall waste.',
    },
    sections: [
      {
        heading: {
          lt: 'Mažiau chemijos',
          en: 'Less Chemicals',
        },
        body: {
          lt: 'Apdeginta mediena gali būti apsaugota be agresyvių impregnatorių.',
          en: 'Charred wood can be protected without aggressive preservatives.',
        },
      },
      {
        heading: {
          lt: 'Ilgesnis gyvavimo ciklas',
          en: 'Longer Lifecycle',
        },
        body: {
          lt: 'Ilgesnis tarnavimo laikas reiškia retesnį keitimą ir mažesnį resursų naudojimą.',
          en: 'A longer service life means fewer replacements and less resource use.',
        },
      },
      {
        heading: {
          lt: 'Natūralus grožis',
          en: 'Natural Beauty',
        },
        body: {
          lt: 'Degintas paviršius išlaiko medienos faktūrą ir reikalauja minimalios apdailos.',
          en: 'The charred surface keeps the wood grain visible and needs minimal finishing.',
        },
      },
    ],
    body: {
      lt: [
        'Tvari architektūra reikalauja sprendimų, kurie išlieka ilgai. Shou Sugi Ban atitinka šį kriterijų.',
        'Jei rūpinatės CO2 pėdsaku, rinkitės medieną iš atsakingų miškų ir tvarius apdirbimo būdus.',
        'Ilgalaikė investicija į tvarumą visada atsiperka – tiek estetikos, tiek eksploatacijos prasme.',
      ],
      en: [
        'Sustainable architecture needs solutions that last. Shou Sugi Ban meets that requirement.',
        'If you care about CO2 impact, select wood from responsible forests and sustainable processing.',
        'Long-term investment in sustainability pays off in both aesthetics and operations.',
      ],
    },
    callout: {
      lt: 'Tvarumas – tai ne tik medžiaga, bet ir tai, kaip ilgai ji tarnauja.',
      en: 'Sustainability is not just the material—it is how long it lasts.',
    },
    closing: {
      lt: 'Norite tvaraus fasado? Susisiekite – paruošime sprendimą jūsų projektui.',
      en: 'Looking for a sustainable facade? Contact us for a tailored solution.',
    },
    heroImage: assets.projects[4],
    gallery: [assets.categories.facades, assets.categories.terrace],
    featureImages: [assets.projects[2], assets.projects[5]],
    author: 'Yakiwood',
    date: '2025-01-05',
    category: { lt: 'Tvarumas', en: 'Sustainability' },
    published: true,
    readTimeMinutes: 4,
  },
  {
    id: 'order-process',
    slug: {
      lt: 'nuo-pavyzdzio-iki-montavimo',
      en: 'from-sample-to-installation',
    },
    title: {
      lt: 'Nuo pavyzdžio iki montavimo: kaip vyksta užsakymas',
      en: 'From Sample to Installation: How the Order Works',
    },
    excerpt: {
      lt: 'Aiškus užsakymo procesas leidžia greičiau priimti sprendimus. Štai kokių žingsnių tikėtis.',
      en: 'A clear process helps you decide faster. Here are the steps to expect.',
    },
    summary: {
      lt: 'Pradedame nuo konsultacijos ir pavyzdžių. Toliau – pasirinkimas, gamyba, logistika ir, jei reikia, montavimo rekomendacijos.',
      en: 'We start with consultation and samples. Then comes selection, production, logistics, and installation guidance if needed.',
    },
    sections: [
      {
        heading: {
          lt: '1. Pavyzdžiai',
          en: '1. Samples',
        },
        body: {
          lt: 'Išsirinkite spalvą ir profilį pagal realius pavyzdžius.',
          en: 'Choose color and profile based on real samples.',
        },
      },
      {
        heading: {
          lt: '2. Pasiūlymas',
          en: '2. Proposal',
        },
        body: {
          lt: 'Paruošiame kainą pagal kiekį, profilį ir pristatymo vietą.',
          en: 'We prepare pricing based on quantity, profile, and delivery location.',
        },
      },
      {
        heading: {
          lt: '3. Gamyba ir pristatymas',
          en: '3. Production & Delivery',
        },
        body: {
          lt: 'Sutartu terminu gaminame ir organizuojame logistiką.',
          en: 'We manufacture on schedule and organize logistics.',
        },
      },
    ],
    body: {
      lt: [
        'Dauguma klientų sprendimą priima po pavyzdžių peržiūros. Tai greičiausias būdas pajusti tekstūrą ir spalvą.',
        'Jei turite projektą, atsiųskite brėžinius – galėsime tiksliau paskaičiuoti kiekį.',
        'Montavimo klausimais padedame rekomendacijomis, profilių pasirinkimu ir priežiūros instrukcijomis.',
      ],
      en: [
        'Most clients decide after seeing samples. It is the quickest way to feel the texture and tone.',
        'If you have a project, share drawings so we can calculate quantities accurately.',
        'We assist with installation guidance, profile selection, and maintenance instructions.',
      ],
    },
    callout: {
      lt: 'Kuo aiškesnė informacija pradžioje, tuo greitesnis ir sklandesnis procesas.',
      en: 'The clearer the brief, the faster and smoother the process.',
    },
    closing: {
      lt: 'Pradėkime nuo pavyzdžių – parašykite, ir pasirūpinsime likusia dalimi.',
      en: 'Start with samples—message us and we will handle the rest.',
    },
    heroImage: assets.projects[1],
    gallery: [assets.categories.facades, assets.projects[2]],
    featureImages: [assets.projects[0], assets.projects[3]],
    author: 'Yakiwood',
    date: '2025-01-12',
    category: { lt: 'Procesas', en: 'Process' },
    published: true,
    readTimeMinutes: 4,
  },
  {
    id: 'coastal-projects',
    slug: {
      lt: 'pajurio-projektai',
      en: 'coastal-projects-with-charred-wood',
    },
    title: {
      lt: 'Pajūrio projektai: kaip deginta mediena elgiasi druskingame ore',
      en: 'Coastal Projects: How Charred Wood Handles Salt Air',
    },
    excerpt: {
      lt: 'Druskingas oras ir vėjas kelia iššūkių fasadams. Aptariame, kodėl Yakisugi dažnai pasirenkamas pajūrio architektūrai.',
      en: 'Salt air and wind challenge facades. Here is why Yakisugi is often chosen for coastal architecture.',
    },
    summary: {
      lt: 'Pajūryje svarbiausia atsparumas drėgmei, UV ir vėjui. Deginta mediena sumažina mikroįtrūkimus ir reikalauja retesnio atnaujinimo.',
      en: 'At the coast, moisture, UV, and wind resistance matter most. Charred wood reduces micro-cracking and needs less frequent refresh.',
    },
    sections: [
      {
        heading: {
          lt: 'Medienos rūšies pasirinkimas',
          en: 'Choosing the Species',
        },
        body: {
          lt: 'Maumedis dažnai pasižymi didesniu tankiu, todėl geriau tinka pajūrio sąlygoms.',
          en: 'Larch often has higher density, making it better suited for coastal conditions.',
        },
      },
      {
        heading: {
          lt: 'Alyvos ir apsauga',
          en: 'Oils and Protection',
        },
        body: {
          lt: 'Reguliarus alyvos atnaujinimas padeda išlaikyti spalvą ir apsaugą nuo druskų.',
          en: 'Regular oil refresh helps retain color and protection against salt.',
        },
      },
      {
        heading: {
          lt: 'Montavimo detalės',
          en: 'Installation Details',
        },
        body: {
          lt: 'Ventiliuojamas montavimas ir teisingas vandens nubėgimas yra būtini.',
          en: 'Ventilated installation and proper water runoff are essential.',
        },
      },
    ],
    body: {
      lt: [
        'Pajūrio objektuose rekomenduojame rinktis tamsesnes apdailas, kurios geriau maskuoja natūralius pokyčius.',
        'Svarbu vengti horizontalių detalių, kuriose gali kauptis vanduo.',
        'Kuo geresnis montavimas, tuo retesnės priežiūros reikės ateityje.',
      ],
      en: [
        'For coastal projects, darker finishes often mask natural changes better.',
        'Avoid horizontal details where water can pool.',
        'The better the installation, the less maintenance you need later.',
      ],
    },
    callout: {
      lt: 'Pajūryje medžiaga turi būti atspari, bet ir estetiška – deginta mediena atitinka abu kriterijus.',
      en: 'At the coast, materials must be resilient and beautiful—charred wood delivers both.',
    },
    closing: {
      lt: 'Turite pajūrio projektą? Aptarkime tinkamą medienos rūšį ir apdailą.',
      en: 'Planning a coastal project? Let us recommend the right species and finish.',
    },
    heroImage: assets.projects[3],
    gallery: [assets.categories.facades, assets.projects[5]],
    featureImages: [assets.projects[4], assets.projects[1]],
    author: 'Yakiwood',
    date: '2025-01-20',
    category: { lt: 'Aplinka', en: 'Environment' },
    published: true,
    readTimeMinutes: 5,
  },
  {
    id: 'fire-ready-surfaces',
    slug: {
      lt: 'ugniai-atspari-apdaila',
      en: 'fire-ready-charred-wood',
    },
    title: {
      lt: 'Ugniai atspari apdaila: ką suteikia Shou Sugi Ban',
      en: 'Fire-Ready Surfaces: What Shou Sugi Ban Adds',
    },
    excerpt: {
      lt: 'Degintas paviršius ne tik gražus, bet ir padeda pagerinti atsparumą ugniai. Paaiškiname, kaip tai veikia.',
      en: 'A charred surface is not just beautiful—it can also improve fire resistance. Here is how it works.',
    },
    summary: {
      lt: 'Anglies sluoksnis veikia kaip natūralus barjeras, lėtinantis degimą. Tai vertinga savybė fasadams ir tvoroms.',
      en: 'The carbon layer acts as a natural barrier that slows combustion. This is valuable for facades and fences.',
    },
    sections: [
      {
        heading: {
          lt: 'Natūrali apsauga',
          en: 'Natural Protection',
        },
        body: {
          lt: 'Apdegintas paviršius sumažina deguonies patekimą į gilesnius sluoksnius.',
          en: 'The charred surface reduces oxygen reaching deeper layers.',
        },
      },
      {
        heading: {
          lt: 'Kur tai svarbu',
          en: 'Where It Matters',
        },
        body: {
          lt: 'Tankiai apstatytose teritorijose, prie miško ar sodybose.',
          en: 'In dense neighborhoods, near forests, or rural properties.',
        },
      },
      {
        heading: {
          lt: 'Tinkami sprendimai',
          en: 'Proper Solutions',
        },
        body: {
          lt: 'Svarbu pasirinkti tinkamą profilio ir apdailos kombinaciją, atitinkančią projektavimo reikalavimus.',
          en: 'Choose profile and finish combinations that meet the project requirements.',
        },
      },
    ],
    body: {
      lt: [
        'Nors deginta mediena nėra visiškai nedegi, ji gali būti saugesnė nei neapdorota mediena.',
        'Projektuojant būtina laikytis statybinių normų ir derinti sprendimus su architektu.',
        'Papildomas privalumas – šis apsaugos sluoksnis atrodo estetiškai ir nereikalauja cheminių impregnantų.',
      ],
      en: [
        'Charred wood is not fireproof, but it can be safer than untreated wood.',
        'Designs must still comply with building codes and be coordinated with architects.',
        'A bonus: this protective layer is aesthetic and avoids harsh chemicals.',
      ],
    },
    callout: {
      lt: 'Shou Sugi Ban suteikia apsaugą be kompromisų estetikai.',
      en: 'Shou Sugi Ban adds protection without compromising aesthetics.',
    },
    closing: {
      lt: 'Norite saugesnės apdailos? Pasitarkime dėl jūsų projekto specifikos.',
      en: 'Need a safer finish? Let us discuss your project requirements.',
    },
    heroImage: assets.projects[2],
    gallery: [assets.categories.facades, assets.categories.fence],
    featureImages: [assets.projects[0], assets.projects[4]],
    author: 'Yakiwood',
    date: '2025-01-28',
    category: { lt: 'Saugumas', en: 'Safety' },
    published: true,
    readTimeMinutes: 4,
  },
];

export function localizeBlogPost(post: BlogPost, locale: BlogLocale): LocalizedBlogPost {
  return {
    id: post.id,
    slug: post.slug[locale],
    title: post.title[locale],
    excerpt: post.excerpt[locale],
    summary: post.summary[locale],
    sections: post.sections.map((section) => ({
      heading: section.heading[locale],
      body: section.body[locale],
    })),
    body: post.body[locale],
    callout: post.callout[locale],
    closing: post.closing[locale],
    heroImage: post.heroImage,
    gallery: post.gallery,
    featureImages: post.featureImages,
    author: post.author,
    date: post.date,
    category: post.category[locale],
    published: post.published,
    readTimeMinutes: post.readTimeMinutes,
  };
}

export function getBlogPosts(locale: BlogLocale): LocalizedBlogPost[] {
  return blogPosts.map((post) => localizeBlogPost(post, locale));
}

export function getBlogPostBySlug(slug: string, locale: BlogLocale): LocalizedBlogPost | undefined {
  const post = blogPosts.find((item) => item.slug[locale] === slug);
  if (!post) return undefined;
  return localizeBlogPost(post, locale);
}

export function getRelatedBlogPosts(currentSlug: string, locale: BlogLocale, limit = 3): LocalizedBlogPost[] {
  const related = blogPosts
    .filter((post) => post.slug[locale] !== currentSlug)
    .slice(0, limit);
  return related.map((post) => localizeBlogPost(post, locale));
}

export function normalizeStoredPosts(raw: unknown): BlogPost[] | null {
  if (!Array.isArray(raw)) return null;

  const normalized: BlogPost[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Partial<BlogPost> & {
      title?: string;
      excerpt?: string;
      summary?: string;
      content?: string;
      coverImage?: string;
      gallery?: unknown;
      featureImages?: unknown;
    };

    if (record.title && typeof record.title === 'string') {
      const base = record.title.trim();
      if (!base) continue;
      const slugBase = typeof record.slug === 'string' ? record.slug : base;

      normalized.push({
        id: record.id || `legacy_${base.toLowerCase().replace(/\s+/g, '-')}`,
        slug: { lt: String(slugBase), en: String(slugBase) },
        title: { lt: base, en: base },
        excerpt: { lt: record.excerpt || '', en: record.excerpt || '' },
        summary: { lt: record.summary || record.excerpt || '', en: record.summary || record.excerpt || '' },
        sections: [],
        body: {
          lt: record.content ? [record.content] : [],
          en: record.content ? [record.content] : [],
        },
        callout: { lt: '', en: '' },
        closing: { lt: '', en: '' },
        heroImage: record.coverImage || '',
        gallery: [],
        featureImages: [],
        author: record.author || 'Yakiwood',
        date: record.date || new Date().toISOString().slice(0, 10),
        category: { lt: record.category || '', en: record.category || '' },
        published: typeof record.published === 'boolean' ? record.published : true,
        readTimeMinutes: 4,
      });
      continue;
    }

    if (
      record.slug &&
      typeof record.slug === 'object' &&
      record.title &&
      typeof record.title === 'object'
    ) {
      normalized.push(record as BlogPost);
    }
  }

  return normalized.length > 0 ? normalized : null;
}
