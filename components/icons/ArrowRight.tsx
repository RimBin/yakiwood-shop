import React from 'react';

type ArrowRightProps = {
  color?: string;
  className?: string;
};

export default function ArrowRight({
  color = '#161616',
  className,
}: ArrowRightProps) {
  return (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'w-[20px] h-[16px]'}
      aria-hidden="true"
    >
      <path 
        d="M2 8H16" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M11 4L16 8L11 12" 
        stroke={color} 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
