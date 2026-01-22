import React from 'react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { getSectionPadding } from '@/lib/design-system';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

export default async function Steps() {
	const locale = await getLocale();
	const currentLocale: AppLocale = locale === 'lt' ? 'lt' : 'en';
	const t = await getTranslations('home.steps');
	const shopHref = toLocalePath('/products', currentLocale);

	const steps = [
		{
			number: '1',
			title: t('items.1.title'),
			description: t('items.1.description'),
		},
		{
			number: '2',
			title: t('items.2.title'),
			description: t('items.2.description'),
		},
		{
			number: '3',
			title: t('items.3.title'),
			description: t('items.3.description'),
		},
		{
			number: '4',
			title: t('items.4.title'),
			description: t('items.4.description'),
		},
	];

	return (
		<section className="w-full bg-[#161616] overflow-hidden">
			{/* ===== MOBILE LAYOUT (< 1024px) - Figma 759:7672 ===== */}
			<div className={`xl:hidden ${getSectionPadding()}`}>
				{/* Title Section - Mobile/Tablet */}
				<div className="mb-[32px] md:mb-[40px]">
					<p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-white mb-[8px]">
						{t('eyebrow')}
					</p>
					<p
						className="font-['DM_Sans'] font-light leading-none text-white max-w-[600px]"
						style={{
							fontSize: 'clamp(32px, 6vw, 52px)',
							letterSpacing: 'clamp(-1.6px, -0.04em, -2.08px)',
						}}
					>
						<span>{t('headline.prefix')}</span>
						<span className="font-['Tiro_Tamil'] italic">{t('headline.emphasis')}</span>
						<span>{t('headline.suffix')}</span>
					</p>
				</div>

				{/* Steps with vertical/horizontal line */}
				<div className="relative md:grid md:grid-cols-2 md:gap-x-[64px] md:gap-y-[40px] pl-[40px] md:pl-0">
					{/* Vertical connecting line - mobile only */}
					<div className="md:hidden absolute left-[15px] top-[24px] bottom-[24px] w-[1px] bg-[#535353]" />

					{/* Steps */}
					<div className="flex flex-col gap-[32px] md:contents">
						{steps.map((step, index) => (
							<div
								key={index}
								className="relative flex flex-col gap-[16px] md:gap-[12px]"
							>
								{/* Step number circle */}
								<div className="absolute md:relative left-[-40px] md:left-0 top-0 bg-[#161616] border border-[#535353] rounded-[100px] w-[32px] h-[32px] flex items-center justify-center mb-0 md:mb-[8px]">
									<p className="font-['DM_Sans'] font-medium text-[12px] leading-[1.1] tracking-[0.36px] uppercase text-white">
										{step.number}
									</p>
								</div>
								{/* Step content */}
								<div className="flex flex-col gap-[8px]">
									<p className="font-['DM_Sans'] font-medium text-[16px] md:text-[18px] leading-[1.2] tracking-[-0.36px] text-white">
										{step.title}
									</p>
									<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] max-w-[280px] md:max-w-full">
										{step.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* CTA Button - Mobile/Tablet */}
				<div className="mt-[32px] md:mt-[48px]">
					<Link
						href={shopHref}
						className="bg-white w-full md:w-auto md:min-w-[240px] h-[48px] rounded-[100px] flex items-center justify-center px-[40px]"
						aria-label={t('cta.aria')}
					>
						<span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
							{t('cta.label')}
						</span>
					</Link>
				</div>
			</div>

			{/* ===== DESKTOP LAYOUT (>= 1024px) ===== */}
			<div className="hidden xl:block max-w-[1440px] mx-auto px-[40px] relative">
				{/* Title Section - Figma pattern: eyebrow at left-[0], heading at left-[calc(25%+24px)] */}
				<div className="absolute left-[40px] top-[120px] text-white font-normal z-10 w-full">
					<p className="absolute font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase left-[0px] top-[25px] whitespace-nowrap">
						{t('eyebrow')}
					</p>
					<p className="absolute font-['DM_Sans'] font-light text-[80px] leading-none tracking-[-4.4px] left-[calc(25%+24px)] top-[0px] w-[574px] whitespace-pre-wrap">
						<span>{t('headline.prefix')}</span>
						<span className="font-['Tiro_Tamil'] italic">{t('headline.emphasis')}</span>
						<span>{t('headline.suffix')}</span>
					</p>
				</div>

				{/* Steps Section */}
				<div className="absolute left-[40px] top-[345px] w-[1306px]">
					{/* Connecting line */}
					<div className="absolute h-0 left-[22px] top-[24px] w-[1174px]">
						<div className="w-[1174px] h-px bg-[#535353]" />
					</div>

					{/* Step 1 */}
					<div className="absolute flex flex-col gap-[16px] items-start left-0 top-0 w-[198px]">
						<div className="bg-[#161616] border border-[#535353] border-solid flex items-center justify-center rounded-[100px] shrink-0 w-[48px] h-[48px]">
							<p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
								1
							</p>
						</div>
						<div className="flex flex-col gap-[8px] items-start w-full">
							<p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white whitespace-pre-wrap w-[117px]">
								Customize Your Order
							</p>
							<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] whitespace-pre-wrap w-[198px]">
								Choose wood type, color, width, and height to match your needs.
							</p>
						</div>
					</div>

					{/* Step 2 */}
					<div className="absolute flex flex-col gap-[16px] items-start left-[393px] top-0 w-[218px]">
						<div className="bg-[#161616] border border-[#535353] border-solid flex items-center justify-center rounded-[100px] shrink-0 w-[48px] h-[48px]">
							<p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
								2
							</p>
						</div>
						<div className="flex flex-col gap-[8px] items-start w-full">
							<p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white whitespace-pre-wrap w-[138px]">
								Add to Cart & Checkout
							</p>
							<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] whitespace-pre-wrap w-[157px]">
								Review your selection and proceed with secure payment.
							</p>
						</div>
					</div>

					{/* Step 3 */}
					<div className="absolute flex flex-col gap-[16px] items-start left-[804px] top-0 w-[106px]">
						<div className="bg-[#161616] border border-[#535353] border-solid flex items-center justify-center rounded-[100px] shrink-0 w-[48px] h-[48px]">
							<p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
								3
							</p>
						</div>
						<div className="flex flex-col gap-[8px] items-start w-full">
							<p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white whitespace-pre-wrap w-[106px]">
								Select Delivery
							</p>
							<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] whitespace-pre-wrap min-w-full">
								Pick a shipping option that suits you best.
							</p>
						</div>
					</div>

					{/* Step 4 */}
					<div className="absolute flex flex-col gap-[16px] items-start left-[1172px] top-0 w-[134px]">
						<div className="bg-[#161616] border border-[#535353] border-solid flex items-center justify-center rounded-[100px] shrink-0 w-[48px] h-[48px]">
							<p className="font-['DM_Sans'] font-medium text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-white">
								4
							</p>
						</div>
						<div className="flex flex-col gap-[8px] items-start w-full">
							<p className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] tracking-[-0.36px] text-white whitespace-pre-wrap w-[102px]">
								Receive Your Order
							</p>
							<p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#BBBBBB] whitespace-pre-wrap w-[134px]">
								We pack and ship your wood safely to your doorstep.
							</p>
						</div>
					</div>
				</div>

				{/* CTA Button */}
				<div className="absolute left-[40px] top-[584px] w-[1360px] h-[48px] flex items-center justify-center">
					<Link
						href={shopHref}
						className="bg-white flex items-center justify-center px-[40px] py-[10px] rounded-[100px] w-full h-full"
						aria-label={t('cta.aria')}
					>
						<span className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#161616]">
							{t('cta.label')}
						</span>
					</Link>
				</div>

				{/* Min height to accommodate absolute positioning */}
				<div className="h-[752px]" />
			</div>
		</section>
	);
}
