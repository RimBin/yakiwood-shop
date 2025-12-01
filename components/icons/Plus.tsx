import React from 'react';

type PlusProps = {
  color?: string;
  className?: string;
};

export default function Plus({
  color = '#161616',
  className,
}: PlusProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? 'w-[20px] h-[20px]'}
      aria-hidden="true"
    >
      <line
        x1="10"
        y1="3"
        x2="10"
        y2="17"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="3"
        y1="10"
        x2="17"
        y2="10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
