import Image from 'next/image';

export default function AnnouncementBar() {
  const features = [
    {
      icon: '/assets/icons/package.svg',
      text: 'Fast delivery',
    },
    {
      icon: '/assets/icons/coins.svg',
      text: 'money back garantee',
    },
    {
      icon: '/assets/icons/plant.svg',
      text: 'eco-friendly',
    },
  ];

  return (
    <div className="bg-[#161616] flex gap-[200px] items-center justify-center px-[40px] py-[8px] w-full">
      {features.map((feature, index) => (
        <div key={index} className="flex gap-[8px] items-center">
          <div className="relative shrink-0 w-[24px] h-[24px]">
            <Image
              src={feature.icon}
              alt=""
              width={24}
              height={24}
              className="w-full h-full"
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
