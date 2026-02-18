export type EuProjectSection = {
  title: string;
  paragraphs: string[];
};

export type EuProjectsContent = {
  pageTitle: string;
  logoAlt: string;
  sections: EuProjectSection[];
};

export const euProjectsContent: Record<'en' | 'lt', EuProjectsContent> = {
  en: {
    pageTitle: 'EU projects',
    logoAlt: 'Funded by the European Union',
    sections: [
      {
        title: 'Implementation and visual configuration of e-sales transaction conclusion solutions',
        paragraphs: [
          'UAB “Yakiwood” is implementing the project “Implementation and visual configuration of e-sales transaction conclusion solutions”. The main goal of the project is the digitalization of the services provided, optimization of order processing processes by implementing e-sales transaction conclusion solutions, service configuration and visualization tools. Thanks to the implemented solutions, placing orders in electronic space will become more convenient, resources for their management will be optimized, and development opportunities will open up.',
          'The project is being implemented in accordance with the Economic Transformation and Competitiveness Development Programme Progress Measure No. 1 of the Ministry of Economy and Innovation of the Republic of Lithuania, the manager of the 2022-2030 development programme. 05-001-01-05-05 “Promoting digitalization of enterprises” activity “Promoting digitalization of micro, small and medium-sized enterprises by financing e-configuration and visualization” (Central and Western Lithuania region)”.',
          'The total value of the project is 105,662.50 EUR, of which 49,990.40 EUR is allocated from the European Regional Development Fund.',
          'The project implementation period is from 2024/06 to 2025/06',
        ],
      },
      {
        title: 'Improving energy efficiency at UAB Yakiwood',
        paragraphs: [
          'UAB Yakiwood is implementing the project “Improving energy efficiency at UAB Yakiwood”, the aim of which is to implement solutions to increase energy efficiency and thus reduce greenhouse gas emissions in the technological process by at least 30%.',
          'UAB Yakiwood is a thermal processing company for wooden boards, which thermally processes (burns), polishes and paints sawn wood (boards) intended for interior and exterior decoration of building premises. The project will contribute not only to lower primary energy consumption and reduction of GHG emissions, but also to Lithuania’s overall impact on climate change, promotion of clean and fair energy, circular economy, adaptation to climate change, prevention and risk management of extreme climate events, and solving the problem of air pollution and efficient use of resources. The annually increasing amount of energy consumed and increased energy prices encourage the company to assess the amount of energy consumed and the possibilities of using energy more efficiently by increasing energy efficiency. Also, taking into account the establishment of global trends of sustainable consumption and environmental friendliness in both competitors and end users, it encourages the company to search for the implementation of various measures, technologies, and processes that protect the environment and reduce the amount of GHG. UAB “Yakiwood” conducted an energy consumption audit and, following the recommendations provided therein, plans to install equipment that will allow the company to use energy more efficiently and reduce the company’s GHG emissions.',
          'The project will be implemented under the Economic Transformation and Competitiveness Development Programme of the Ministry of Economy and Innovation of the Republic of Lithuania, the manager of the 2022-2030 development programme, Progress Measure No. 05-001-01-04-02 “Encouraging enterprises to transition towards a climate-neutral economy” activity “Increasing energy efficiency in industrial enterprises”.',
          'Project value: 917,550.00 EUR, of which 596,407.50 EUR was allocated from the European Regional Development Fund.',
          'Project implementation period: from 2024-08-27 to 2027-08-27.',
          'Contact person: Tadas Paškevičius, Tel. No.: +370 656 88581; E-mail: info@yakiwood.eu',
        ],
      },
      {
        title: 'Implementation of Non-Technological Innovations',
        paragraphs: [
          'UAB “Yakiwood” is implementing the project “Implementation of Non-Technological Innovations”.',
          'The goal of the project is to create and introduce new product designs to the market, to introduce process and organizational innovations, thereby increasing export volumes and involvement in international value chains.',
          'When implementing strategic decisions regarding the financing and direction of innovative activities at the company level, it was decided to invest in organizational and process improvement tools that will help not only become a more productive company, but also compete in foreign markets by exporting products. The planned organizational and process innovation solutions will significantly improve the currently lacking systematic production process, will raise employee competence, and work functions will be performed more efficiently. In order to improve the company’s image, increase the quality of work performed, and gain a competitive advantage over other market participants, it would be difficult to do without the planned solutions. The project will also contribute to the creation and introduction of new product designs for the company, thus increasing the company’s export volumes.',
          'The project is implemented under the Economic Transformation and Competitiveness Development Programme Progress Measure No. 05-001-01-05-07 “Create a consistent system for promoting innovative activity”.',
          'The total value of the project is 219,660.01 Eur., of which 108,812.03 Eur. is allocated from the European Regional Development Fund.',
          'The project implementation period is from 2024/11/07 to 2026/11/08.',
        ],
      },
    ],
  },
  lt: {
    pageTitle: 'ES projektai',
    logoAlt: 'Finansuojama Europos Sąjungos',
    sections: [
      {
        title: 'E. pardavimo sandorių sudarymo sprendimų diegimas ir vizuali konfigūracija',
        paragraphs: [
          'UAB „Yakiwood“ įgyvendina projektą „E. pardavimo sandorių sudarymo sprendimų diegimas ir vizuali konfigūracija“. Pagrindinis projekto tikslas - teikiamų paslaugų skaitmeninimas, užsakymų apdorojimo procesų optimizavimas diegiant e. pardavimo sandorių sudarymo sprendimus, paslaugų konfigūravimo ir vizualizacijos įrankius. Įdiegti sprendimai leis patogiau pateikti užsakymus elektroninėje erdvėje, optimizuos jų valdymui reikalingus resursus ir atvers plėtros galimybes.',
          'Projektas įgyvendinamas pagal Lietuvos Respublikos ekonomikos ir inovacijų ministerijos, kaip 2022-2030 m. plėtros programos valdytojos, Ekonomikos transformacijos ir konkurencingumo plėtros programos pažangos priemonę Nr. 05-001-01-05-05 „Skatinti įmonių skaitmeninimą“, veiklą „Skatinti labai mažų, mažų ir vidutinių įmonių skaitmeninimą finansuojant e. konfigūravimą ir vizualizaciją“ (Vidurio ir vakarų Lietuvos regionas).',
          'Bendra projekto vertė - 105 662,50 Eur, iš kurių 49 990,40 Eur skiriama iš Europos regioninės plėtros fondo.',
          'Projekto įgyvendinimo laikotarpis: nuo 2024/06 iki 2025/06.',
        ],
      },
      {
        title: 'Energijos vartojimo efektyvumo didinimas UAB Yakiwood',
        paragraphs: [
          'UAB „Yakiwood“ įgyvendina projektą „Energijos vartojimo efektyvumo didinimas UAB Yakiwood“, kurio tikslas - įdiegti sprendimus, didinančius energijos vartojimo efektyvumą ir mažinančius šiltnamio efektą sukeliančių dujų emisijas technologiniame procese ne mažiau kaip 30 proc.',
          'UAB „Yakiwood“ yra medinių lentų terminio apdorojimo įmonė, kuri termiškai apdoroja (degina), šlifuoja ir dažo pjautinę medieną (lentas), skirtą vidaus ir išorės patalpų apdailai. Projektas prisidės ne tik prie pirminės energijos vartojimo mažinimo ir ŠESD emisijų mažinimo, bet ir prie bendrų Lietuvos tikslų klimato kaitos srityje: švarios ir teisingos energijos skatinimo, žiedinės ekonomikos, prisitaikymo prie klimato kaitos, ekstremalių klimato reiškinių rizikų prevencijos ir valdymo, oro taršos mažinimo bei efektyvaus išteklių naudojimo. Kasmet didėjantis suvartojamos energijos kiekis ir augančios energijos kainos skatina įmonę vertinti energijos suvartojimą bei galimybes energiją naudoti efektyviau didinant energinį efektyvumą. Taip pat, atsižvelgiant į tvaraus vartojimo ir aplinkosaugiškumo tendencijas tiek tarp konkurentų, tiek tarp galutinių vartotojų, įmonė ieško įvairių priemonių, technologijų ir procesų, kurie saugo aplinką ir mažina ŠESD kiekį. UAB „Yakiwood“ atliko energijos vartojimo auditą ir, vadovaudamasi pateiktomis rekomendacijomis, planuoja įdiegti įrangą, kuri leis efektyviau naudoti energiją ir sumažinti įmonės ŠESD emisijas.',
          'Projektas bus įgyvendinamas pagal Lietuvos Respublikos ekonomikos ir inovacijų ministerijos, kaip 2022-2030 m. plėtros programos valdytojos, Ekonomikos transformacijos ir konkurencingumo plėtros programos pažangos priemonę Nr. 05-001-01-04-02 „Skatinti įmones pereiti link klimatui neutralios ekonomikos“, veiklą „Didinti energijos vartojimo efektyvumą pramonės įmonėse“.',
          'Projekto vertė - 917 550,00 Eur, iš kurių 596 407,50 Eur skirta iš Europos regioninės plėtros fondo.',
          'Projekto įgyvendinimo laikotarpis: nuo 2024-08-27 iki 2027-08-27.',
          'Kontaktinis asmuo: Tadas Paškevičius, tel. Nr. +370 656 88581; el. paštas: info@yakiwood.eu',
        ],
      },
      {
        title: 'Netechnologinių inovacijų diegimas',
        paragraphs: [
          'UAB „Yakiwood“ įgyvendina projektą „Netechnologinių inovacijų diegimas“.',
          'Projekto tikslas - sukurti ir rinkai pateikti naujus produktų dizainus, įdiegti proceso ir organizacines inovacijas, taip didinant eksporto apimtis bei įsitraukimą į tarptautines vertės grandines.',
          'Priimant strateginius sprendimus dėl inovacinės veiklos finansavimo ir krypties, nuspręsta investuoti į organizacinių ir procesų tobulinimo priemones. Tai padės ne tik tapti produktyvesne įmone, bet ir konkuruoti užsienio rinkose eksportuojant produkciją. Planuojami organizaciniai ir procesų inovacijų sprendimai reikšmingai pagerins šiuo metu trūkstamą sistemingą gamybos procesą, didins darbuotojų kompetencijas, o funkcijos bus atliekamos efektyviau. Siekiant gerinti įmonės įvaizdį, didinti atliekamų darbų kokybę ir įgyti konkurencinį pranašumą, numatomi sprendimai yra būtini. Projektas taip pat prisidės prie naujų produktų dizainų kūrimo ir diegimo, taip didinant įmonės eksporto apimtis.',
          'Projektas įgyvendinamas pagal Ekonomikos transformacijos ir konkurencingumo plėtros programos pažangos priemonę Nr. 05-001-01-05-07 „Sukurti nuoseklią inovacinės veiklos skatinimo sistemą“.',
          'Bendra projekto vertė - 219 660,01 Eur, iš kurių 108 812,03 Eur skiriama iš Europos regioninės plėtros fondo.',
          'Projekto įgyvendinimo laikotarpis: 2024-11-07 - 2026-11-08.',
        ],
      },
    ],
  },
};
