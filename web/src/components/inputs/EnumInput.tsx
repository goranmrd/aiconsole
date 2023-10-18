import { cn } from '@/utils/styles';

interface EnumInputProps<T extends string> {
  label: string;
  value: T;
  values: T[];
  className?: string;
  onChange: (value: T) => void;
}

export function EnumInput<T extends string>({
  label,
  value,
  values,
  onChange,
}: EnumInputProps<T>) {
  return (
    <div className="flex items-center gap-4">
      <label className="font-bold">{label}:</label>
      <div className="flex gap-2">
        {values.map((val) => (
          <button
            className={cn(
              'bg-white/5 border border-white/10 hover:text-black text-sm hover:bg-primary-light px-3 py-1 rounded-full flow-right',
              val === value && 'bg-primary border-primary text-black',
            )}
            onClick={() => onChange(val)}
            key={val}
          >
            {val}
          </button>
        ))}
      </div>
    </div>
  );
}
