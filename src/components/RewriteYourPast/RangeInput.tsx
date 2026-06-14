interface RangeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function RangeInput({ label, value, onChange, min = 1, max = 10 }: RangeInputProps) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
      <div className="mb-2 flex justify-between gap-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="font-mono text-sm font-semibold text-white">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-500 cursor-pointer"
      />
    </div>
  );
}
