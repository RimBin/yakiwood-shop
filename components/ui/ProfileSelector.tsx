'use client';

interface ProfileSelectorProps {
  profiles: {
    id: string;
    name: string;
    svgPath: string;
  }[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export default function ProfileSelector({ profiles, selectedId, onSelect }: ProfileSelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
        Profile
      </p>
      <div className="flex gap-2 flex-wrap">
        {profiles.map((profile) => {
          const isSelected = selectedId === profile.id;
          return (
            <button
              key={profile.id}
              onClick={() => onSelect(profile.id)}
              className={`h-12 px-3 flex flex-col items-center justify-center relative ${
                isSelected
                  ? 'bg-[#161616]'
                  : 'bg-transparent border border-[#bbbbbb]'
              }`}
              style={{ width: '83px' }}
              title={profile.name}
            >
              <svg
                viewBox="0 0 68 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-[70px] h-[15px]"
              >
                <path
                  d={profile.svgPath}
                  stroke={isSelected ? '#fff' : '#161616'}
                  strokeWidth="1"
                />
              </svg>
              {isSelected && (
                <div className="absolute top-1 right-1 w-3 h-3">
                  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="12" height="12" rx="1" fill="white"/>
                    <path d="M9 4L5 8L3 6" stroke="#161616" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Default profile shapes
export const PROFILE_SHAPES = {
  halfTaper: 'M0 5.5L5 0.5H63L68 5.5V10.5H0V5.5Z',
  rectangle: 'M0 0.5H68V10.5H0V0.5Z',
  rhombus: 'M0 5.5L5 0.5H63L68 5.5L63 10.5H5L0 5.5Z',
  doubleTaper: 'M5 0.5L0 5.5L5 10.5H63L68 5.5L63 0.5H5Z',
};
