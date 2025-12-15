"use client";

import { useState, useRef, useEffect } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatLabel?: (value: number) => string;
  className?: string;
}

export default function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatLabel = (val) => `€${val}`,
  className = '',
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentage = (val: number) => {
    return ((val - min) / (max - min)) * 100;
  };

  const getValueFromPosition = (clientX: number) => {
    if (!trackRef.current) return min;
    
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (thumb: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  const handleTouchStart = (thumb: 'min' | 'max') => (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(thumb);
  };

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!dragging) return;

      const newValue = getValueFromPosition(clientX);
      
      setLocalValue((prev) => {
        if (dragging === 'min') {
          const newMin = Math.min(newValue, prev[1] - step);
          return [Math.max(min, newMin), prev[1]];
        } else {
          const newMax = Math.max(newValue, prev[0] + step);
          return [prev[0], Math.min(max, newMax)];
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      if (dragging) {
        onChange(localValue);
        setDragging(null);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [dragging, localValue, min, max, step, onChange]);

  const minPercent = getPercentage(localValue[0]);
  const maxPercent = getPercentage(localValue[1]);

  return (
    <div className={`w-full ${className}`}>
      <div className="relative h-2 mb-8" ref={trackRef}>
        {/* Track background */}
        <div className="absolute w-full h-1 top-1/2 -translate-y-1/2 bg-[#E1E1E1] rounded-full" />
        
        {/* Active track */}
        <div
          className="absolute h-1 top-1/2 -translate-y-1/2 bg-[#161616] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <div
          className={`absolute w-5 h-5 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#161616] rounded-full cursor-grab shadow-md transition-transform ${
            dragging === 'min' ? 'scale-110 cursor-grabbing' : 'hover:scale-110'
          }`}
          style={{ left: `${minPercent}%` }}
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue[0]}
          tabIndex={0}
        />

        {/* Max thumb */}
        <div
          className={`absolute w-5 h-5 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-[#161616] rounded-full cursor-grab shadow-md transition-transform ${
            dragging === 'max' ? 'scale-110 cursor-grabbing' : 'hover:scale-110'
          }`}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={localValue[1]}
          tabIndex={0}
        />
      </div>

      {/* Value labels */}
      <div className="flex justify-between text-sm font-['DM_Sans'] text-[#161616]">
        <span>{formatLabel(localValue[0])}</span>
        <span>{formatLabel(localValue[1])}</span>
      </div>
    </div>
  );
}
