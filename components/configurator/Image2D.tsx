import Image from 'next/image';

export interface Image2DProps {
  src?: string;
  alt: string;
}

export default function Image2D({ src = '/images/ui/wood/imgSpruce.png', alt }: Image2DProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 60vw"
      priority
      data-testid="configurator-2d-image"
    />
  );
}
