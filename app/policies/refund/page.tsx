import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';
import { getLocale } from 'next-intl/server';

type RefundSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export default async function RefundPolicyPage() {
  const locale = await getLocale();
  const isLt = locale === 'lt';

  const content = isLt
    ? {
        title: 'Grąžinimo politika',
        sectionTitle: 'Grąžinimas',
        sections: [
          {
            title: '1. 14 dienų teisė atsisakyti',
            paragraphs: [
              'Pagal JK Consumer Contracts Regulations 2013 klientai turi teisę atsisakyti internetu įsigytų prekių per 14 dienų nuo prekių gavimo.',
              'Tačiau ši teisė NETAIKOMA:',
              'Produktai, pagaminti pagal pasirinktus matmenis, apdailą ar kiekius, laikomi individualiai gaminamomis prekėmis ir negali būti atšaukti po gamybos pradžios.',
            ],
            bullets: ['prekėms, pagamintoms pagal kliento specifikacijas arba aiškiai personalizuotiems produktams'],
          },
          {
            title: '2. Standartiniai (ne individualiai gaminami) produktai',
            paragraphs: ['Jei produktas yra sandėliuojamas standartinių matmenų ir nėra individualiai gaminamas:'],
            bullets: [
              'klientas gali atsisakyti per 14 dienų nuo pristatymo',
              'prekės turi būti nenaudotos ir tinkamos pakartotiniam pardavimui',
              'grąžinimo siuntimo išlaidas apmoka klientas',
              'grąžinama suma neapima pirminio pristatymo mokesčių',
            ],
          },
          {
            title: '3. Sugadintos arba brokuotos prekės',
            paragraphs: [
              'Pagal Consumer Rights Act 2015 klientai turi teisę gauti prekes, kurios yra:',
            ],
            bullets: [
              'tokios, kaip aprašyta',
              'patenkinamos kokybės',
              'tinkamos naudojimo paskirčiai',
              'jei prekės yra brokuotos arba sugadintos, informuokite mus per 48 val. nuo pristatymo',
              'pateikite nuotraukas ir aprašymą',
              'kai taikoma, organizuosime pakeitimą, remontą arba pinigų grąžinimą',
            ],
          },
          {
            title: '4. Natūralios medžiagos išlyga',
            paragraphs: ['Mediena yra natūrali medžiaga.', 'Šie skirtumai yra natūralios savybės ir nelaikomi defektais:'],
            bullets: ['spalva', 'tekstūra', 'raštas', 'smulkūs paviršiaus įtrūkimai'],
          },
          {
            title: '5. Rizikos perėjimas',
            paragraphs: [
              'Rizika pereina klientui pristatymo momentu.',
              'Nuosavybės teisė pereina tik po pilno apmokėjimo gavimo.',
            ],
          },
        ] as RefundSection[],
      }
    : {
        title: 'Refund Policy',
        sectionTitle: 'Refund',
        sections: [
          {
            title: '1. 14-Day Right to Cancel',
            paragraphs: [
              'Under UK Consumer Contracts Regulations 2013, customers have the right to cancel an online purchase within 14 days of receiving goods.',
              'However, this right does NOT apply to:',
              'Products manufactured according to selected dimensions, finishes, or quantities are classified as custom-made goods and cannot be cancelled once production has started.',
            ],
            bullets: ['Goods made to the customer’s specifications or clearly personalised products'],
          },
          {
            title: '2. Standard (Non-Custom) Products',
            paragraphs: ['If a product is stocked in standard dimensions and not custom-made:'],
            bullets: [
              'Customer may cancel within 14 days of delivery',
              'Goods must be unused and in resellable condition',
              'Customer is responsible for return shipping costs',
              'Refund will exclude original delivery charges',
            ],
          },
          {
            title: '3. Damaged or Faulty Goods',
            paragraphs: ['Under the Consumer Rights Act 2015, customers have the right to receive goods that are:'],
            bullets: [
              'As described',
              'Of satisfactory quality',
              'Fit for purpose',
              'If goods are faulty or damaged, notify us within 48 hours of delivery',
              'Provide photos and description',
              'We will arrange replacement, repair, or refund where appropriate',
            ],
          },
          {
            title: '4. Natural Material Disclaimer',
            paragraphs: ['Wood is a natural material.', 'Variations in the following are natural characteristics and do not constitute defects:'],
            bullets: ['Colour', 'Texture', 'Grain', 'Minor surface cracks'],
          },
          {
            title: '5. Risk Transfer',
            paragraphs: [
              'Risk transfers to the customer upon delivery.',
              'Ownership transfers after full payment has been received.',
            ],
          },
        ] as RefundSection[],
      };

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {content.title}
          </h1>
        </PageCover>
      </InView>

      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pt-[20px] sm:pt-[24px] pb-[80px] sm:pb-[120px]">
          <div className="grid grid-cols-1 sm:grid-cols-[344px_1fr] gap-[24px] sm:gap-[40px]">
            <div className="sm:col-start-1 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
              <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                {content.sectionTitle}
              </h2>
            </div>
            <div className="sm:col-start-2 space-y-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '160ms' }}>
              {content.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                    {section.title}
                  </h3>

                  {section.paragraphs?.map((paragraph) => (
                    <p
                      key={`${section.title}-${paragraph.slice(0, 24)}`}
                      className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616] mb-[8px]"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="list-disc pl-[20px] space-y-[2px]">
                      {section.bullets.map((bullet) => (
                        <li
                          key={`${section.title}-${bullet}`}
                          className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]"
                        >
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </InView>
    </main>
  );
}
