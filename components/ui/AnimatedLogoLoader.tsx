import { colors } from '@/lib/design-system/tokens';

type AnimatedLogoLoaderProps = {
  text?: string;
  className?: string;
  fullScreen?: boolean;
};
const logoLetters = 'YAKIWOOD'.split('');

export default function AnimatedLogoLoader({
  text = 'Kraunama...',
  className = '',
  fullScreen = false,
}: AnimatedLogoLoaderProps) {
  return (
    <div
      className={`${fullScreen ? 'min-h-screen' : 'h-full'} w-full flex items-center justify-center ${className}`}
      style={{ backgroundColor: colors.background.grey }}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="font-['DM_Sans'] text-[32px] leading-[35.2px] tracking-[-1.28px] text-[#161616]"
          aria-hidden="true"
        >
          {logoLetters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="yaki-loader-letter"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <span className="sr-only">Yakiwood</span>
        <p className="font-['Outfit'] text-[14px] leading-[18.2px] tracking-[0.14px] text-[#535353]">
          {text}
        </p>
      </div>
    </div>
  );
}