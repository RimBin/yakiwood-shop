import { PageCover } from '@/components/shared/PageLayout';
import InView from '@/components/InView';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { toLocalePath } from '@/i18n/paths';

export default async function PoliciesPage() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const isLt = currentLocale === 'lt';

  const content = isLt
    ? {
        pageTitle: 'Politikos',
        deliveryTitle: 'Pristatymas',
        standardDeliveryTitle: 'Standartinis pristatymas',
        standardDeliveryBody: 'Standartinis pristatymas paprastai trunka 3-5 darbo dienas.',
        expressDeliveryTitle: 'Skubus pristatymas',
        expressDeliveryBody:
          'Skubus pristatymas galimas pasirinktose vietovėse. Pristatymo terminas 2-3 darbo dienos, taikomas papildomas mokestis.',
        shippingCostsTitle: 'Pristatymo kaina',
        shippingCostsBody:
          'Pristatymo kaina apskaičiuojama pagal užsakymo svorį, matmenis ir pristatymo adresą. Tiksli suma pateikiama atsiskaitymo metu.',
        paymentTitle: 'Apmokėjimas',
        acceptedMethodsTitle: 'Priimami apmokėjimo būdai',
        acceptedMethodsBody:
          'Priimame Visa, Mastercard, Apple Pay / Google Pay (per Stripe), PayPal ir bankinį pavedimą (pagal užklausą).',
        paymentSecurityTitle: 'Mokėjimo saugumas',
        paymentSecurityBody:
          'Visi mokėjimai apdorojami per saugias mokėjimo sistemas, naudojant SSL šifravimą. Jūsų kortelės duomenų nesaugome.',
        invoicesTitle: 'Sąskaitos faktūros',
        invoicesBody:
          'Sąskaita faktūra išsiunčiama el. paštu po mokėjimo patvirtinimo. Jei reikalinga PVM sąskaita įmonei, susisiekite su mumis ir pateikite įmonės duomenis.',
        refundTitle: 'Grąžinimas',
        refundBody:
          'Nenaudotas prekes originalioje pakuotėje galima grąžinti per 30 kalendorinių dienų. Individualūs ir pagal matmenis gaminami užsakymai negrąžinami, išskyrus gamybinio broko atvejus. Norėdami inicijuoti grąžinimą, susisiekite su klientų aptarnavimo komanda ir pateikite užsakymo numerį bei grąžinimo priežastį. Patvirtinus grąžinimą, atsiųsime tolesnes instrukcijas. Lėšos grąžinamos per 5-7 darbo dienas nuo grąžintos prekės gavimo.',
        termsLinkLabel: 'Taisyklės ir sąlygos',
      }
    : {
        pageTitle: 'Policies',
        deliveryTitle: 'Delivery',
        standardDeliveryTitle: 'Standard Delivery',
        standardDeliveryBody: 'Standard delivery usually takes 3-5 business days.',
        expressDeliveryTitle: 'Express Delivery',
        expressDeliveryBody:
          'Express delivery is available for select locations. Delivery time is 2-3 business days with additional fees.',
        shippingCostsTitle: 'Shipping Costs',
        shippingCostsBody:
          'Shipping costs are calculated based on order weight, dimensions, and destination. Final cost is shown at checkout.',
        paymentTitle: 'Payment',
        acceptedMethodsTitle: 'Accepted Payment Methods',
        acceptedMethodsBody:
          'We accept Visa, Mastercard, Apple Pay / Google Pay (via Stripe), PayPal, and bank transfers (on request).',
        paymentSecurityTitle: 'Payment Security',
        paymentSecurityBody:
          'All payments are processed through secure payment gateways using SSL encryption. We do not store your credit card information.',
        invoicesTitle: 'Invoices',
        invoicesBody:
          'An invoice is sent to your email after payment confirmation. For businesses requiring VAT invoices, please contact us with your company details.',
        refundTitle: 'Refund',
        refundBody:
          'We offer a 30-day return policy for unused products in their original packaging. Custom orders and cut-to-size products are non-refundable unless there is a manufacturing defect. To initiate a return, contact our customer service team with your order number and reason for return. Once approved, you will receive return instructions. Refunds are processed within 5-7 business days after we receive the returned items.',
        termsLinkLabel: 'Terms & Conditions',
      };

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover Section */}
      <InView className="hero-animate-root">
        <PageCover>
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616] hero-seq-item hero-seq-right"
            style={{ fontVariationSettings: "'opsz' 14", animationDelay: '0ms' }}
          >
            {content.pageTitle}
          </h1>
        </PageCover>
      </InView>

      {/* Content */}
      <InView className="hero-animate-root">
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pt-[20px] sm:pt-[24px] pb-[80px] sm:pb-[120px]">
        <div className="grid grid-cols-1 sm:grid-cols-[344px_1fr] gap-[24px] sm:gap-[40px]">
          {/* Delivery Section */}
          <div className="sm:col-start-1 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              {content.deliveryTitle}
            </h2>
          </div>
          <div className="sm:col-start-2 space-y-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '160ms' }}>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.standardDeliveryTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.standardDeliveryBody}
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.expressDeliveryTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.expressDeliveryBody}
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.shippingCostsTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.shippingCostsBody}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB]" />

          {/* Payment Section */}
          <div className="sm:col-start-1 hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              {content.paymentTitle}
            </h2>
          </div>
          <div className="sm:col-start-2 space-y-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '480ms' }}>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.acceptedMethodsTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.acceptedMethodsBody}
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.paymentSecurityTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.paymentSecurityBody}
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                {content.invoicesTitle}
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                {content.invoicesBody}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB]" />

          {/* Refund Section */}
          <div className="sm:col-start-1 hero-seq-item hero-seq-right" style={{ animationDelay: '640ms' }}>
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              {content.refundTitle}
            </h2>
          </div>
          <div className="sm:col-start-2 hero-seq-item hero-seq-right" style={{ animationDelay: '800ms' }}>
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
              {content.refundBody}
            </p>
            <Link
              href={toLocalePath('/policies/terms', currentLocale)}
              className="mt-[12px] inline-block font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] underline"
            >
              {content.termsLinkLabel}
            </Link>
          </div>
        </div>
      </div>
      </InView>
    </main>
  );
}
