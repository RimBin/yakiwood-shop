'use client';

interface QuantityInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
}

export default function QuantityInput({ label, value, onChange, unit = 'm²', min = 1, max = 10000 }: QuantityInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
        {label} {unit}
      </p>
      <div className="border border-[#bbbbbb] h-12 flex items-center px-4 gap-2">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="flex-1 font-['Outfit'] font-normal text-[14px] leading-[1.1] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
        />
      </div>
    </div>
  );
}
