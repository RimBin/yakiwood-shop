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
      lt: 'Deginta mediena nėra vien tik išvaizda. Tinkamai apdorotas paviršius tampa atsparesnis drėgmei, UV spinduliams ir kenkėjams, todėl fasadai bei terasos ilgiau išlaiko tvirtumą. Šis tradicinis japonų metodas, žinomas kaip Shou Sugi Ban arba Yakisugi, šimtmečius buvo naudojamas medinių pastatų apsaugai. Šiuolaikinėje architektūroje jis tampa vis populiaresnis dėl unikaliuų estetinių savybių ir ilgaamžiškumo.',
      en: 'Charred wood is not just about looks. Properly treated surfaces become more resistant to moisture, UV exposure, and pests, so facades and terraces keep their strength longer. This traditional Japanese method, known as Shou Sugi Ban or Yakisugi, has been used for centuries to protect wooden structures. In modern architecture, it is becoming increasingly popular due to its unique aesthetic qualities and durability.',
    },
    sections: [
      {
        heading: {
          lt: 'Įvadas į degintos medienos meną',
          en: 'Introduction to the Art of Wood Burning',
        },
        body: {
          lt: 'Shou Sugi Ban technologija kilo senovės Japonijoje, kur mediena buvo deginama atvirame liepsna, siekiant apsaugoti ją nuo drėgmės, vabzdžių ir ugnies. Šis metodas sukuria natūralų anglies sluoksnį, kuris veikia kaip barjeras, blokuojantis drėgmę ir kenksmingus organizmus. Šiandien ši technika naudojama ne tik praktiniais, bet ir estetiniais tikslais – sukuriamas gilus juodas ar rudo atspalvio paviršius su unikaliu grūdų raižiniu.',
          en: 'The Shou Sugi Ban technique originated in ancient Japan, where wood was charred over open flames to protect it from moisture, insects, and fire. This method creates a natural carbon layer that acts as a barrier, blocking moisture and harmful organisms. Today, this technique is used not only for practical purposes but also for aesthetic appeal—creating deep black or brown surfaces with unique grain patterns.',
        },
      },
      {
        heading: {
          lt: 'Degintos medienos naudojimo namuose privalumai',
          en: 'The Benefits of Using Wood in Home Interiors, Facades, and Terraces',
        },
        body: {
          lt: 'Deginta mediena siūlo daug privalumų, kurie daro ją idealiu pasirinkimu fasadams, terasoms ir interjerams. Pirma, ji yra labai atspari oro sąlygoms – anglies sluoksnis sumažina drėgmės įsigėrimą ir apsaugo nuo UV spindulių žalos. Antra, ši mediena pasižymi ilgaamžiškumu: tinkamai prižiūrimas paviršius gali tarnauti dešimtmečius be reikšmingų pakeitimų. Trečia, deginta mediena yra natūrali ir ekologiška – nereikalauja cheminių impregnantų, kurie gali būti kenksmingi aplinkai.',
          en: 'Charred wood offers numerous benefits that make it an ideal choice for facades, terraces, and interiors. First, it is highly weather-resistant—the carbon layer reduces moisture absorption and protects against UV damage. Second, this wood is durable: a properly maintained surface can last for decades without significant changes. Third, charred wood is natural and eco-friendly—it does not require chemical preservatives that can harm the environment.',
        },
      },
      {
        heading: {
          lt: 'Įvairūs degintos medienos metodai',
          en: 'Various Burnt Wood Techniques',
        },
        body: {
          lt: 'Egzistuoja kelios degintos medienos gamybos technikos, kiekviena suteikianti skirtingą estetinį ir funkcinį rezultatą. Klasikinis Shou Sugi Ban metodas apima medienos deginimą atvirame liepsna, po kurio paviršius šukuojamas, pašalinant silpnesnį anglies sluoksnį ir atskleidžiant gilesnes grūdų linijas. Kita populiari technika – „Yaki-sugi" kontroliuojamu intensyvumu, kurio metu mediena deginama skirtingais temperatūros lygiais.',
          en: 'Several charred wood production techniques exist, each providing a different aesthetic and functional result. The classic Shou Sugi Ban method involves charring wood over an open flame, after which the surface is brushed to remove the weaker carbon layer and reveal deeper grain lines. Another popular technique is \"Yaki-sugi\" with controlled intensity, where wood is charred at different temperature levels.',
        },
      },
      {
        heading: {
          lt: 'Kodėl ši technologija veikia',
          en: 'Why This Technique Works',
        },
        body: {
          lt: 'Apdeginimas uždaro medienos poras, o paviršius tampa tankesnis. Tai sumažina vandens įsigėrimą ir palengvina priežiūrą. Anglies sluoksnis, susidariusi per deginimo procesą, veikia kaip natūrali barjeras prieš drėgmę, grybus ir kenkėjus. Šis procesas taip pat pagerina medienos atsparumą ugniai, nes apanglintas paviršius degsta lėčiau nei neapdorota mediena.',
          en: 'Charring closes the wood pores and densifies the surface. This reduces water absorption and simplifies maintenance. The carbon layer formed during the charring process acts as a natural barrier against moisture, fungi, and pests. This process also improves wood fire resistance, as the carbonized surface burns slower than untreated wood.',
        },
      },
      {
        heading: {
          lt: 'Kur ji atsiskleidžia geriausiai',
          en: 'Where It Shines Most',
        },
        body: {
          lt: 'Ventiliuojami fasadai, terasos, akcentinės sienos ir detalės, kur svarbus gylis, tekstūra bei kontrastas. Deginta mediena idealiai tinka šiuolaikinei architektūrai, kur minimalistiniai sprendimai derinami su natūraliomis medžiagomis. Fasadai su degintos medienos apdaila sukuria stiprų vizualinį akcentą ir išsiskiria iš kitų pastatų.',
          en: 'Ventilated facades, terraces, feature walls, and details where depth, texture, and contrast matter. Charred wood is ideal for modern architecture, where minimalist solutions are combined with natural materials. Facades with charred wood cladding create a strong visual accent and stand out from other buildings.',
        },
      },
      {
        heading: {
          lt: 'Užsakymo patarimai',
          en: 'Ordering Tips',
        },
        body: {
          lt: 'Pasidalinkite projekto vieta, norimu profiliu ir spalvos nuorodomis. Tai leidžia pasiūlyti optimalų sprendimą ir kainą. Svarbu nurodyti fasado ar terasos plotą, medienos rūšies pageidavimus (eglė, pušis, maumedis) bei deginimo intensyvumą. Jei turite vizualinius pavyzdžius ar nuorodas, praneškite – tai padės tiksliau parinkti tinkamą apdailą.',
          en: 'Share the project location, preferred profile, and color references. This helps us propose the best solution and pricing. It is important to specify the facade or terrace area, wood species preferences (spruce, pine, larch), and charring intensity. If you have visual examples or references, let us know—this will help accurately select the right finish.',
        },
      },
    ],
    body: {
      lt: [
        'Deginta mediena suteikia architektūrai solidumo: tamsūs tonai išryškina formas, o šukuota tekstūra pabrėžia natūralią kilmę. Dėl to ji tinka tiek minimalistinėms, tiek tradicinėms kompozicijoms. Šiuolaikinė architektūra vis dažniau renkasi natūralias medžiagas, kurios ne tik gražiai atrodo, bet ir atitinka tvarumo principus. Deginta mediena yra vienas tokių sprendimų – ji ekologiška, ilgaamžiška ir estetiškai patraukli.',
        'Degintos medienos unikalumas slypi jos tekstūroje ir spalvoje. Kiekviena lenta yra unikali, nes grūdų raštai ir deginimo intensyvumas gali skirtis. Tai leidžia sukurti individualų fasadą ar terasą, kuri neturi analogų. Be to, deginta mediena gerai dera su įvairiomis kitomis medžiagomis – betoną, akmeniu, stiklu, plienu.',
        'Renkantis apdailą verta įvertinti ekspoziciją saulėje ir drėgmę. Stipriai apdegintos lentos bus tamsesnės, o švelniai degintos – subtiliai rusvos. Taip pat svarbu atsižvelgti į klimatinius veiksnius: pajūrio zonose rekomenduojama rinktis tamsesnes apdailas ir tankesnę medieną (maumedis), o kontinentinėse vietose gali tikti švelnesnė eglė ar pušis.',
        'Jei norite unikalios estetikos, derinkite skirtingus profilius ar kryptis. Tai sukuria ritmą ir išskirtinį šešėlių žaismą. Pavyzdžiui, horizontaliai montuotos lentos fasadą daro vizualiai platesnį, o vertikalios – aukštesnį. Galima derinti ir skirtingų plotį lentas, siekiant sukurti dinamišką ritmą.',
        'Svarbu nepamiršti ir techninių aspektų: tinkamas montavimas yra raktas į ilgą tarnavimo laiką. Būtina užtikrinti ventiliacijos tarpus tarp lentų ir pagrindo, kad drėgmė galėtų laisvai išgaruoti. Taip pat reikia naudoti atsparių korozijai tvirtinimo elementų – nerūdijančio plieno ar cinkuoto metalo.',
        'Prieš pasirinkdami spalvą, peržiūrėkite pavyzdžius skirtingu paros metu – rytinė ir vakarinė šviesa atskleidžia skirtingą atspalvį.',
        'Natūralus patamsėjimas laikui bėgant nėra defektas – tai patina, kuri suteikia fasadui dar daugiau charakterio.',
        'Jei planuojate derinti su metalu ar stiklu, verta iš anksto suplanuoti mazgus, kad mediena galėtų kvėpuoti.',
      ],
      en: [
        'Charred wood gives architecture a sense of weight: dark tones emphasize form, while brushed textures highlight its natural origin. It fits both minimalist and traditional compositions. Modern architecture increasingly chooses natural materials that not only look beautiful but also meet sustainability principles. Charred wood is one such solution—it is eco-friendly, durable, and aesthetically appealing.',
        'The uniqueness of charred wood lies in its texture and color. Each board is unique because grain patterns and charring intensity can vary. This allows creating an individual facade or terrace that has no analogues. Moreover, charred wood pairs well with various other materials—concrete, stone, glass, steel.',
        'When choosing a finish, consider sun exposure and moisture. Heavily charred boards are darker, while lightly charred ones read warmer and softer. It is also important to consider climatic factors: coastal areas recommend darker finishes and denser wood (larch), while continental locations may suit softer spruce or pine.',
        'If you want a unique aesthetic, mix profiles or orientations. This creates rhythm and distinctive shadow play. For example, horizontally mounted boards make the facade visually wider, while vertical ones make it taller. You can also combine boards of different widths to create dynamic rhythm.',
        'It is important not to forget the technical aspects: proper installation is key to long service life. Ventilation gaps must be ensured between boards and the substrate so moisture can evaporate freely. Corrosion-resistant fasteners must also be used—stainless steel or galvanized metal.',
        'Before choosing a tone, view samples at different times of day—morning and evening light reveal different shades.',
        'Natural darkening over time is not a defect—it is a patina that adds character to the facade.',
        'If you plan to pair wood with metal or glass, detail the junctions early so the wood can breathe.',
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
    readTimeMinutes: 7,
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
        'Svarbu įvertinti ne tik pradinę kainą, bet ir atnaujinimo dažnį bei laiką.',
        'Jei norite labai tamsaus fasado, Yakisugi suteikia gilesnį toną be dažų.',
        'Termomediena gerai tinka, kai norite šilto atspalvio ir minimalios tekstūros.',
      ],
      en: [
        'First define the goal: bold contrast or warm natural tone. Yakisugi is the choice when you want an unmistakable character.',
        'For south-facing or coastal facades, maintenance schedules matter. Yakisugi typically holds its tone longer.',
        'When selecting species (spruce or larch), consider profile options too. Profiles change the overall visual rhythm.',
        'Consider not only the upfront price but also how often and how long refreshes will take.',
        'If you want a very dark facade, Yakisugi delivers a deeper tone without paint.',
        'Thermowood is a strong fit when you want a warm hue and minimal texture.',
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
    readTimeMinutes: 7,
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
        'Ritmui kurti naudinga kartoti profilio modulį ties langais ir kampais.',
        'Skirtingi profiliai gali būti derinami viename fasade, jei laikotės aiškios taisyklės.',
        'Apšvietimas vakare dar labiau paryškina reljefą, todėl verta numatyti šviestuvų vietas.',
      ],
      en: [
        'Profile choices are best made with the architect. A subtle texture can elevate a facade instantly.',
        'Orientation also affects perceived scale, especially for smaller buildings.',
        'If you are unsure, test several profiles on real samples before deciding.',
        'For rhythm, repeat the profile module around windows and corners.',
        'Different profiles can be combined on one facade if you follow a clear rule.',
        'Evening lighting highlights relief even more, so plan fixture placement early.',
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
    readTimeMinutes: 6,
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
        'Po stipresnių audrų verta apžiūrėti fasadą ir pašalinti prilipusius nešvarumus.',
        'Plovimui naudokite neutralius, be chloro valiklius, o šepetį rinkitės minkštą.',
        'Alyvą tepkite ant sausos, švarios medienos plonu sluoksniu, kad neatsirastų dėmių.',
      ],
      en: [
        'During the first year, observe color changes. This helps plan the first refresh.',
        'If the facade is close to trees, rinse it once a year to remove resin or organic buildup.',
        'With a clear plan, upkeep is quick and cost-effective.',
        'After heavy storms, inspect the facade and remove any stuck debris.',
        'Use neutral, chlorine-free cleaners and a soft brush for washing.',
        'Apply oil on dry, clean wood in a thin layer to avoid blotches.',
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
    readTimeMinutes: 6,
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
        'Jei terasa prie baseino, rinkitės mažiau šukuotą profilį, kad būtų lengviau valyti.',
        'Laiptų pakopoms rekomenduojame storesnes lentas ir paslėptą tvirtinimą.',
        'Šešėlinėse zonose periodiškai patikrinkite pelėsio riziką.',
      ],
      en: [
        'Before installation, ensure a solid substructure and proper ventilation. This limits moisture buildup.',
        'For terraces we often recommend larch for its density and durability.',
        'Use stainless steel fasteners for maximum service life.',
        'If the terrace is near a pool, choose a less brushed profile for easier cleaning.',
        'For stairs, we recommend thicker boards and concealed fastening.',
        'In shaded zones, check periodically for mold risk.',
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
    readTimeMinutes: 6,
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
        'Jei erdvėje daug šviesos, tamsi siena suteiks kontrastą ir gylį.',
        'Virtuvėse ar komercinėse erdvėse rinkitės alyvuotą apdailą dėl lengvesnio valymo.',
        'Nedideliuose kambariuose tinka vienas akcentinis plotas, kad erdvė neatrodytų per sunki.',
      ],
      en: [
        'For a softer feel, choose oiled or lightly brushed surfaces.',
        'Indoors, narrower profiles often look more refined.',
        'To keep the finish consistent, order from a single batch.',
        'If the space has lots of light, a dark wall adds contrast and depth.',
        'In kitchens or commercial areas, choose oiled finishes for easier cleaning.',
        'In smaller rooms, a single accent wall keeps the space from feeling heavy.',
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
    readTimeMinutes: 6,
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
        'Deginta mediena sumažina cheminių dangų poreikį, todėl patalpose yra mažiau lakiųjų junginių.',
        'Ilgaamžiškumas reiškia mažiau transporto ir gamybos ciklų per pastato gyvenimą.',
        'Rinkdamiesi vietinę medieną, papildomai mažinate logistikos pėdsaką.',
      ],
      en: [
        'Sustainable architecture needs solutions that last. Shou Sugi Ban meets that requirement.',
        'If you care about CO2 impact, select wood from responsible forests and sustainable processing.',
        'Long-term investment in sustainability pays off in both aesthetics and operations.',
        'Charred wood reduces the need for chemical coatings, meaning fewer VOCs indoors.',
        'Durability means fewer transport and production cycles over a building’s life.',
        'Choosing local wood further reduces the logistics footprint.',
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
    readTimeMinutes: 6,
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
        'Kai turime aiškų kiekį, pateikiame kelias kainos alternatyvas skirtingoms rūšims.',
        'Gamybos metu suderiname spalvos nuokrypius, kad partija būtų vientisa.',
        'Prieš pristatymą suderiname sandėliavimą ir montavimo grafiką, kad viskas vyktų sklandžiai.',
      ],
      en: [
        'Most clients decide after seeing samples. It is the quickest way to feel the texture and tone.',
        'If you have a project, share drawings so we can calculate quantities accurately.',
        'We assist with installation guidance, profile selection, and maintenance instructions.',
        'Once quantities are clear, we provide price options for different species.',
        'During production, we align color variations to keep the batch consistent.',
        'Before delivery, we coordinate storage and installation timing so everything runs smoothly.',
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
    readTimeMinutes: 6,
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
        'Druskos dalelės veikia paviršių kaip abrazyvas, todėl apsauginė alyva tampa dar svarbesnė.',
        'Rekomenduojame tvirtinimus iš nerūdijančio plieno, kad išvengtumėte korozijos.',
        'Fasadų mazguose numatykite papildomus vandens nubėgimo sprendimus.',
      ],
      en: [
        'For coastal projects, darker finishes often mask natural changes better.',
        'Avoid horizontal details where water can pool.',
        'The better the installation, the less maintenance you need later.',
        'Salt particles act as a mild abrasive, so protective oil becomes even more important.',
        'We recommend stainless steel fasteners to avoid corrosion.',
        'At facade junctions, plan extra water runoff solutions.',
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
    readTimeMinutes: 6,
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
        'Didesnis apdegimo gylis gali padidinti atsparumą, tačiau reikia išlaikyti struktūrinį tvirtumą.',
        'Tokiems projektams verta rinktis tankesnę medieną ir tinkamą profilio geometriją.',
        'Visada derinkite sprendimą su vietiniais reglamentais ir gaisrinės saugos reikalavimais.',
      ],
      en: [
        'Charred wood is not fireproof, but it can be safer than untreated wood.',
        'Designs must still comply with building codes and be coordinated with architects.',
        'A bonus: this protective layer is aesthetic and avoids harsh chemicals.',
        'Deeper charring can improve resistance, but structural integrity must be preserved.',
        'For such projects, choose denser species and the right profile geometry.',
        'Always align the solution with local regulations and fire safety requirements.',
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
    readTimeMinutes: 6,
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

      const categoryValue = (() => {
        const c = record.category as unknown;
        if (typeof c === 'string') return { lt: c, en: c };
        if (c && typeof c === 'object') {
          const obj = c as Record<string, unknown>;
          return {
            lt: typeof obj.lt === 'string' ? obj.lt : '',
            en: typeof obj.en === 'string' ? obj.en : '',
          };
        }
        return { lt: '', en: '' };
      })();

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
        category: categoryValue,
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
