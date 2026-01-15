import { PageCover } from '@/components/shared/PageLayout';

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover Section */}
      <PageCover>
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
            style={{ fontVariationSettings: "'opsz' 14" }}>
          Policies
        </h1>
      </PageCover>

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
        <div className="grid grid-cols-1 sm:grid-cols-[344px_1fr] gap-[24px] sm:gap-[40px]">
          {/* Delivery Section */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              Delivery
            </h2>
          </div>
          <div className="sm:col-start-2 space-y-[24px]">
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Standard Delivery
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                Standard delivery takes 3-5 business days within the UK.
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Express Delivery
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                Express delivery is available for select locations. Delivery time is 2-3 business days with additional fees.
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Shipping Costs
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                Shipping costs are calculated based on order weight, dimensions, and destination. Free shipping is available for orders over €500 within the UK (mainland).
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB]" />

          {/* Payment Section */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              Payment
            </h2>
          </div>
          <div className="sm:col-start-2 space-y-[24px]">
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Accepted Payment Methods
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                We accept Visa, Mastercard, Apple Pay / Google Pay (via Stripe), PayPal, and bank transfers (on request).
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Payment Security
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                All payments are processed through secure payment gateways using SSL encryption. We do not store your credit card information.
              </p>
            </div>
            <div>
              <h3 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.5] text-[#161616] mb-[8px]">
                Invoices
              </h3>
              <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
                An invoice will be sent to your email after payment confirmation. For businesses requiring VAT invoices, please contact us with your company details.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 h-px bg-[#BBBBBB]" />

          {/* Refund Section */}
          <div className="sm:col-start-1">
            <h2 className="font-['Outfit'] font-normal text-[14px] sm:text-[16px] leading-[1.3] tracking-[0.14px] sm:tracking-[0.16px] uppercase text-[#161616]">
              Refund
            </h2>
          </div>
          <div className="sm:col-start-2">
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.5] text-[#161616]">
              We offer a 30-day return policy for unused products in their original packaging. Custom orders and cut-to-size products are non-refundable unless there is a manufacturing defect. To initiate a return, contact our customer service team with your order number and reason for return. Once approved, you will receive instructions for shipping the items back. Refunds are processed within 5-7 business days after we receive the returned items. Shipping costs for returns are the responsibility of the customer unless the return is due to our error or a defective product. Items must be returned in the same condition as received, with all original packaging and documentation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
