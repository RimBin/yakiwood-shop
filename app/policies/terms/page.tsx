import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';
import { getLocale } from 'next-intl/server';

type TermsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const ltSections: TermsSection[] = [
  {
    title: '1. Įmonės informacija',
    paragraphs: [
      'Šią svetainę valdo Yakiwood Ltd (arba jūsų registruotas JK juridinis asmuo).',
      'Registruotas adresas: [Įrašykite JK adresą]',
      'Įmonės numeris: [Įrašykite numerį]',
      'El. paštas: [Įrašykite el. paštą]',
      'Telefonas: [Įrašykite telefoną]',
      'Pateikdami užsakymą šioje svetainėje, jūs sutinkate su šiomis taisyklėmis ir sąlygomis.',
    ],
  },
  {
    title: '2. Produktai',
    paragraphs: [
      'Tiekiame degintos medienos dailylentes ir terasines lentas.',
      'Dėl medienos, kaip natūralios medžiagos, savybių, šie skirtumai yra natūralūs ir nelaikomi defektais:',
      'Svetainėje pateikiamos nuotraukos yra tik iliustracinio pobūdžio.',
    ],
    bullets: ['spalva', 'tekstūra', 'raštas', 'smulkūs įtrūkimai ar paviršiaus pokyčiai'],
  },
  {
    title: '3. Užsakymai ir apmokėjimas',
    paragraphs: [
      'Visi užsakymai turi būti pilnai apmokėti atsiskaitymo metu.',
      'Užsakymas laikomas priimtu, kai mokėjimas sėkmingai gautas ir išsiųstas patvirtinimo el. laiškas.',
      'Pasiliekame teisę atsisakyti arba atšaukti bet kurį užsakymą iki jo išsiuntimo.',
    ],
  },
  {
    title: '4. Individualiai gaminami produktai',
    paragraphs: [
      'Produktai, pagaminti pagal kliento pasirinktus parametrus, yra laikomi individualiai gaminamomis prekėmis.',
      'Pagal kliento pasirinktus:',
      'Pateikdami tokį užsakymą patvirtinate, kad gamyba pradedama netrukus po mokėjimo patvirtinimo.',
      'Individualiai gaminamų produktų negalima atšaukti po gamybos pradžios.',
    ],
    bullets: ['matmenys', 'apdaila', 'spalva', 'kiekis'],
  },
  {
    title: '5. Pristatymas',
    paragraphs: [
      'Pristatymas galimas visoje Didžiosios Britanijos žemyninėje dalyje.',
      'Dėl dydžio ir svorio pristatymas vykdomas paletiniais kroviniais.',
      'Pristatymas vykdomas tik iki sklypo ribos (kerbside).',
      'Rizika pereina klientui pristatymo momentu.',
      'Klientas privalo:',
    ],
    bullets: ['užtikrinti saugų privažiavimą transportui', 'būti vietoje pristatymo metu', 'apžiūrėti prekes jų gavimo metu'],
  },
  {
    title: '6. Teisė atsisakyti sutarties (Consumer Contracts Regulations 2013)',
    paragraphs: [
      'Vartotojai turi 14 dienų atsisakyti internetu įsigytų standartinių (ne individualiai gaminamų) prekių.',
      'Ši teisė NETAIKOMA:',
      'Todėl individualiai gaminamos medienos lentos negali būti atšauktos pradėjus gamybą.',
    ],
    bullets: ['prekėms, pagamintoms pagal vartotojo specifikacijas arba aiškiai personalizuotoms prekėms'],
  },
  {
    title: '7. Grąžinimai – standartiniai (ne individualiai gaminami) produktai',
    paragraphs: [
      'Jei produktas yra standartinis sandėlio produktas (ne individualiai gaminamas):',
    ],
    bullets: [
      'atsisakyti galima per 14 dienų nuo pristatymo',
      'prekės turi būti nenaudotos ir tinkamos pakartotiniam pardavimui',
      'grąžinimo siuntimo išlaidas apmoka klientas',
      'grąžinant nekompensuojami pradiniai pristatymo mokesčiai',
      'pinigai grąžinami per 14 dienų nuo grąžintų prekių gavimo',
    ],
  },
  {
    title: '8. Sugadintos arba brokuotos prekės',
    paragraphs: [
      'Pagal Consumer Rights Act 2015 prekės turi būti:',
      'Jei prekės brokuotos:',
      'Galime pasiūlyti:',
    ],
    bullets: [
      'tokios, kaip aprašyta',
      'patenkinamos kokybės',
      'tinkamos naudojimo paskirčiai',
      'informuokite mus per 48 valandas',
      'pateikite nuotraukas',
      'pakeitimą',
      'remontą',
      'dalinį arba pilną grąžinimą',
      'natūralūs medienos skirtumai nelaikomi defektu',
    ],
  },
  {
    title: '9. Atsakomybės ribojimas',
    paragraphs: [
      'Mes neatsakome už:',
      'Mūsų bendra atsakomybė negali viršyti užsakymo vertės.',
    ],
    bullets: ['netiesioginius nuostolius', 'montavimo klaidas', 'žalą, atsiradusią dėl netinkamo sandėliavimo ar naudojimo'],
  },
  {
    title: '10. Nenugalima jėga',
    paragraphs: [
      'Mes neatsakome už vėlavimus dėl aplinkybių, kurių negalime kontroliuoti, įskaitant:',
    ],
    bullets: ['transporto trikdžius', 'medžiagų trūkumą', 'stichinius reiškinius'],
  },
  {
    title: '11. Taikytina teisė',
    paragraphs: [
      'Šioms taisyklėms taikoma Anglijos ir Velso teisė.',
      'Visi ginčai sprendžiami JK teismų jurisdikcijoje.',
    ],
  },
];

const enSections: TermsSection[] = [
  {
    title: '1. Company Information',
    paragraphs: [
      'This website is operated by Yakiwood Ltd (or your registered UK entity).',
      'Registered address: [Insert UK address]',
      'Company number: [Insert number]',
      'Email: [Insert email]',
      'Phone: [Insert phone]',
      'By placing an order on this website, you agree to these Terms & Conditions.',
    ],
  },
  {
    title: '2. Products',
    paragraphs: [
      'We supply charred timber cladding and decking boards.',
      'Due to the nature of wood as a natural material, the following variations are natural characteristics and do not constitute defects:',
      'Images displayed on the website are for illustrative purposes only.',
    ],
    bullets: ['Colour', 'Texture', 'Grain', 'Minor cracks or surface changes'],
  },
  {
    title: '3. Orders & Payment',
    paragraphs: [
      'All orders must be paid in full at checkout.',
      'An order is considered accepted once payment is successfully received and confirmation email is issued.',
      'We reserve the right to refuse or cancel any order prior to dispatch.',
    ],
  },
  {
    title: '4. Custom-Made Products',
    paragraphs: [
      'Products manufactured according to customer-selected options are classified as custom-made goods.',
      'Products manufactured according to customer-selected:',
      'By placing such an order, you acknowledge that production begins shortly after payment confirmation.',
      'Custom-made products cannot be cancelled once production has started.',
    ],
    bullets: ['Dimensions', 'Finish', 'Colour', 'Quantity'],
  },
  {
    title: '5. Delivery',
    paragraphs: [
      'Delivery is available throughout mainland United Kingdom.',
      'Due to size and weight, delivery is made via pallet freight.',
      'Delivery is kerbside only.',
      'Risk passes to the customer upon delivery.',
      'Customer must:',
    ],
    bullets: ['Ensure safe vehicle access', 'Be present at delivery', 'Inspect goods upon arrival'],
  },
  {
    title: '6. Right to Cancel (Consumer Contracts Regulations 2013)',
    paragraphs: [
      'Consumers have 14 days to cancel standard (non-custom) goods purchased online.',
      'This right does NOT apply to:',
      'Therefore, custom-made timber boards are non-cancellable once production has commenced.',
    ],
    bullets: ['Goods made to the consumer’s specifications or clearly personalised goods'],
  },
  {
    title: '7. Returns – Standard (Non-Custom) Products',
    paragraphs: ['If the product is standard stock (non-custom):'],
    bullets: [
      'Cancellation is allowed within 14 days of delivery',
      'Goods must be unused and in resalable condition',
      'Customer is responsible for return shipping costs',
      'Refund excludes original delivery charges',
      'Refunds are processed within 14 days of receiving returned goods',
    ],
  },
  {
    title: '8. Faulty or Damaged Goods',
    paragraphs: ['Under the Consumer Rights Act 2015, goods must be:', 'If goods are faulty:', 'We may offer:'],
    bullets: [
      'As described',
      'Of satisfactory quality',
      'Fit for purpose',
      'Notify us within 48 hours',
      'Provide photographic evidence',
      'Replacement',
      'Repair',
      'Partial or full refund',
      'Natural wood variation is not considered a defect',
    ],
  },
  {
    title: '9. Limitation of Liability',
    paragraphs: [
      'We shall not be liable for:',
      'Our total liability shall not exceed the value of the order.',
    ],
    bullets: ['Indirect losses', 'Installation errors', 'Damage caused by improper storage or handling'],
  },
  {
    title: '10. Force Majeure',
    paragraphs: [
      'We are not liable for delays caused by circumstances beyond our control including:',
    ],
    bullets: ['Transport disruptions', 'Material shortages', 'Natural events'],
  },
  {
    title: '11. Governing Law',
    paragraphs: [
      'These Terms are governed by the laws of England and Wales.',
      'Any disputes shall be subject to the jurisdiction of UK courts.',
    ],
  },
];

export default async function TermsPolicyPage() {
  const locale = await getLocale();
  const isLt = locale === 'lt';

  const pageTitle = isLt ? 'Taisyklės ir sąlygos' : 'Terms & Conditions';
  const pageSubtitle = isLt
    ? '(Jungtinė Karalystė – JK sandėlio vykdymas)'
    : '(United Kingdom – UK Warehouse Fulfilment)';
  const sectionLabel = isLt ? 'Taisyklės' : 'Terms';
  const sections = isLt ? ltSections : enSections;

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {pageTitle}
          </h1>
          <p
            className="mt-[12px] font-['Outfit'] font-light text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] hero-seq-item hero-seq-right"
            style={{ animationDelay: '80ms' }}
          >
            {pageSubtitle}
          </p>
        </PageCover>
      </InView>

      <InView className="hero-animate-root">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pt-[20px] sm:pt-[24px] pb-[80px] sm:pb-[120px]">
          <div className="grid grid-cols-1 sm:grid-cols-[344px_1fr] gap-[24px] sm:gap-[40px]">
            <div className="sm:col-start-1 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
              <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
                {sectionLabel}
              </h2>
            </div>

            <div className="sm:col-start-2 space-y-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '160ms' }}>
              {sections.map((section, index) => (
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
                    <ul className="list-disc pl-[20px] space-y-[4px]">
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

                  {index < sections.length - 1 && <div className="h-px bg-[#BBBBBB] mt-[24px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </InView>
    </main>
  );
}
