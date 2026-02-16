import Image from 'next/image';
import { getLocale } from 'next-intl/server';
import { assets } from '@/lib/assets';
import { PageCover, PageLayout } from '@/components/shared/PageLayout';
import { euProjectsContent } from '@/data/eu-projects';

export default async function EuProjectsPage() {
  const locale = await getLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const content = euProjectsContent[currentLocale];

  return (
    <main className="bg-[#E1E1E1] min-h-screen">
      <PageCover>
        <h1 className="font-['DM_Sans'] font-normal text-[54px] md:text-[72px] leading-[1] tracking-[-2.16px] text-[#161616]">
          {content.pageTitle}
        </h1>
      </PageCover>

      <PageLayout className="py-[32px] md:py-[40px]">
        <div className="w-full flex items-center">
          <div className="relative w-[220px] h-[86px] md:w-[320px] md:h-[128px]">
            <Image
              src={assets.certifications.eu}
              alt={content.logoAlt}
              fill
              sizes="(min-width: 768px) 320px, 220px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      </PageLayout>

      <PageLayout className="pb-[64px] md:pb-[96px]">
        <div className="w-full">
          {content.sections.map((section, index) => (
            <section
              key={section.title}
              className={`py-[28px] md:py-[34px] ${index !== 0 ? 'border-t border-[#BBBBBB]' : ''}`}
            >
              <h2 className="font-['DM_Sans'] font-medium text-[20px] md:text-[26px] leading-[1.2] tracking-[-0.8px] md:tracking-[-1px] text-[#161616] mb-[14px] md:mb-[18px]">
                {section.title}
              </h2>
              <div className="flex flex-col gap-[10px] md:gap-[12px]">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="font-['Outfit'] font-light text-[14px] md:text-[16px] leading-[1.5] text-[#535353]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </PageLayout>
    </main>
  );
}
