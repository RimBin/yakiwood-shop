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
    <div className="bg-[#161616] flex gap-[200px] items-center justify-center px-[40px] py-[8px] w-full">
      {features.map((feature, index) => (
        <div key={index} className="feature group flex gap-[8px] items-center">
          <div className="relative shrink-0 w-[24px] h-[24px] icon-wrapper">
            <Image
              src={feature.icon}
              alt=""
              width={24}
              height={24}
              className="icon-image w-full h-full"
            />
          </div>
          <p className="font-['Outfit'] font-normal leading-[1.2] text-[12px] text-white tracking-[0.6px] uppercase">
            {feature.text}
          </p>
        </div>
      ))}
    </div>
  );
}
