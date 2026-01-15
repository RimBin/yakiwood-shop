import Link from 'next/link';
import NotFoundTracker from '@/components/NotFoundTracker';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E1E1E1] px-[16px] sm:px-[24px] lg:px-[40px] py-[64px]">
      <NotFoundTracker />
      <div className="max-w-[720px] mx-auto">
        <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[96px] leading-[0.95] tracking-[-2.8px] md:tracking-[-4.8px] text-[#161616]">
          404
        </h1>
        <p className="mt-[16px] font-['Outfit'] font-light text-[16px] leading-[1.4] text-[#535353]">
          Puslapis nerastas.
        </p>
        <div className="mt-[32px]">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-[48px] px-[40px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity"
          >
            Į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
