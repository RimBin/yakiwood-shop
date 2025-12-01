import Accordion from '@/components/ui/Accordion';

const faqItems = [
  {
    title: 'What is Shou Sugi Ban?',
    content: 'Shou Sugi Ban is an ancient Japanese technique of preserving wood by charring it. This process creates a unique, durable finish that is naturally resistant to fire, insects, and rot.',
    defaultOpen: true,
  },
  {
    title: 'How long does burnt wood last?',
    content: 'When properly treated with Shou Sugi Ban technique, wood can last 80-100 years or more without requiring significant maintenance.',
  },
  {
    title: 'Do you ship internationally?',
    content: 'Yes, we ship our products worldwide. Shipping costs and delivery times vary depending on your location. Contact us for specific shipping quotes.',
  },
  {
    title: 'Can I customize the color?',
    content: 'Absolutely! We offer various charring levels from light to deep black, and can also apply different finishes and oils to achieve your desired look.',
  },
  {
    title: 'What wood species do you use?',
    content: 'We primarily work with pine, larch, and cedar. Each species offers unique characteristics in terms of grain pattern and durability.',
  },
  {
    title: 'Do you offer installation services?',
    content: 'Yes, we can recommend professional installation partners in your area, or provide detailed installation guidelines for DIY projects.',
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      {/* Cover Section */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pt-[32px] pb-[40px] sm:pt-[32px] sm:pb-[64px]">
        <h1 className="font-['DM_Sans'] font-light text-[56px] sm:text-[128px] leading-[0.95] tracking-[-2.24px] sm:tracking-[-5.12px] text-[#161616]">
          FAQ
        </h1>
      </div>

      {/* FAQ Content */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[40px] pb-[80px] sm:pb-[120px]">
        <div className="max-w-[1016px] mx-auto sm:ml-[384px]">
          <Accordion items={faqItems} />
        </div>
      </div>
    </main>
  );
}
