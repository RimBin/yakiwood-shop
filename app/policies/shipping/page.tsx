import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';
import { getLocale } from 'next-intl/server';

export default async function ShippingPolicyPage() {
  const locale = await getLocale();
  const isLt = locale === 'lt';

  const content = isLt
    ? {
        title: 'Pristatymas',
        sectionTitle: 'Pristatymas',
        firstTitle: '1. Užsakymų apdorojimas',
        firstBody:
          'Visi užsakymai pilnai apmokami atsiskaitymo metu. Užsakymas laikomas patvirtintu, kai mokėjimas sėkmingai gautas. Individualiai gaminamiems produktams gamyba pradedama per 24-48 val. po mokėjimo patvirtinimo. Numatomas gamybos terminas: 2-3 savaitės (jei taikoma). Jei produktas yra JK sandėlyje, išsiuntimas per 2-3 darbo dienas.',
        secondTitle: '2. Pristatymo teritorija',
        secondBody:
          'Pristatome visoje Didžiosios Britanijos žemyninėje dalyje (Anglija, Škotija, Velsas).',
        secondBodyExtra:
          'Pristatant į Šiaurės Airiją, Highlands ir salų teritorijas gali būti taikomi papildomi mokesčiai.',
        thirdTitle: '3. Pristatymo būdas',
        thirdBody:
          'Dėl medienos lentų dydžio ir svorio pristatymas vykdomas paletinių krovinių tarnyba. Pristatymas vykdomas tik iki sklypo ribos (kerbside).',
        thirdLead: 'Klientas privalo:',
        thirdBullets: [
          'užtikrinti saugų privažiavimą pristatymo transportui',
          'būti pristatymo adresu pristatymo metu',
          'apžiūrėti prekes jų gavimo metu',
        ],
        thirdBodyExtra: 'Jei pristatymo metu nieko nėra vietoje, gali būti taikomas pakartotinio pristatymo mokestis.',
        fourthTitle: '4. Pristatymo terminas',
        fourthBody:
          'Sandėlyje esančios prekės: 2-7 darbo dienos. Pagal užsakymą gaminamos prekės: 3-4 savaitės bendrai (gamyba + pristatymas).',
        fourthBodyExtra: 'Pristatymo terminai yra orientaciniai ir negarantuojami.',
      }
    : {
        title: 'Shipping',
        sectionTitle: 'Delivery',
        firstTitle: '1. Order Processing',
        firstBody:
          'All orders are paid in full at checkout. Orders are confirmed once payment is successfully received. For custom-made products, production begins within 24–48 hours after payment confirmation. Estimated production time: 2–3 weeks (if applicable). If product is in stock at UK warehouse: dispatch within 2–3 working days.',
        secondTitle: '2. Delivery Area',
        secondBody:
          'We deliver throughout mainland United Kingdom (England, Scotland, Wales).',
        secondBodyExtra:
          'Deliveries to Northern Ireland, Highlands, and offshore areas may incur additional charges.',
        thirdTitle: '3. Delivery Method',
        thirdBody:
          'Due to the size and weight of timber boards, delivery is made via pallet freight service. Delivery is kerbside only.',
        thirdLead: 'Customer must:',
        thirdBullets: [
          'Ensure safe access for delivery vehicle',
          'Be present at delivery address',
          'Inspect goods upon arrival',
        ],
        thirdBodyExtra: 'If no one is present, re-delivery charges may apply.',
        fourthTitle: '4. Delivery Time',
        fourthBody:
          'In-stock products: 2–7 working days. Made-to-order products: 3–4 weeks total (production + delivery).',
        fourthBodyExtra: 'Delivery times are estimates and not guaranteed.',
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
              <div>
                <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                  {content.firstTitle}
                </h3>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                  {content.firstBody}
                </p>
              </div>
              <div>
                <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                  {content.secondTitle}
                </h3>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                  {content.secondBody}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616] mt-[8px]">
                  {content.secondBodyExtra}
                </p>
              </div>
              <div>
                <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                  {content.thirdTitle}
                </h3>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                  {content.thirdBody}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616] mt-[8px]">
                  {content.thirdLead}
                </p>
                <ul className="list-disc pl-[20px] mt-[4px] space-y-[2px]">
                  {content.thirdBullets.map((bullet) => (
                    <li key={bullet} className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                      {bullet}
                    </li>
                  ))}
                </ul>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616] mt-[8px]">
                  {content.thirdBodyExtra}
                </p>
              </div>
              <div>
                <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                  {content.fourthTitle}
                </h3>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                  {content.fourthBody}
                </p>
                <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616] mt-[8px]">
                  {content.fourthBodyExtra}
                </p>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </main>
  );
}
