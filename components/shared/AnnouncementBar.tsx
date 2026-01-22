import Image from 'next/image';
import { getAsset } from '@/lib/assets';

export default function AnnouncementBar() {
  const features = [
    {
      icon: getAsset('imgIconTruck'),
      text: 'Fast delivery',
    },
    {
      icon: getAsset('imgIconCoins'),
      text: 'Money back guarantee',
    },
    {
      icon: getAsset('imgIconPlant'),
      text: 'Eco-friendly',
    },
  ];

  return (
    <div className="bg-[#161616] w-full py-[8px] px-[clamp(12px,4vw,40px)]">
      <div className="max-w-[1440px] mx-auto flex items-center justify-center w-full gap-[clamp(12px,5vw,200px)]">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`feature group items-center gap-[8px] ${
              index === 0
                ? 'flex'
                : index === 1
                  ? 'hidden min-[640px]:flex'
                  : 'hidden min-[1024px]:flex'
            }`}
          >
            <div className="relative shrink-0 w-[24px] h-[24px] icon-wrapper">
              <Image
                src={feature.icon}
                alt=""
                width={24}
                height={24}
                className="icon-image w-full h-full"
              />
            </div>
            <p
              className="font-['Outfit'] font-normal leading-[1.2] text-white tracking-[0.6px] uppercase whitespace-nowrap"
              style={{ fontSize: 'clamp(10px, 2.4vw, 12px)' }}
            >
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
