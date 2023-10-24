import { cn } from '@/utils/styles';
import { Tooltip } from '../Tooltip';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface EnumInputProps<T extends string> {
  label: string;
  value: T;
  values: T[];
  className?: string;
  onChange: (value: T) => void;
  disabled?: boolean;
  withTooltip?: boolean;
  tootltipText?: string;
}

export function EnumInput<T extends string>({
  label,
  value,
  values,
  onChange,
  disabled = false,
  withTooltip = false,
  tootltipText,
}: EnumInputProps<T>) {
  return (
    <div className="flex items-center gap-4">
      <label className="font-bold flex items-center gap-1">
        {label}
        {withTooltip ? (
          <Tooltip
            label={tootltipText}
            position="top-end"
            offset={{ mainAxis: 7 }}
          >
            <InformationCircleIcon className="w-4 h-4" />
          </Tooltip>
        ) : null}
        :
      </label>
      <div className="flex gap-2">
        {values.map((val) => (
          <button
            disabled={disabled}
            className={cn(
              'bg-white/5 border border-white/10 hover:text-black text-sm hover:bg-primary-light px-3 py-1 rounded-full flow-right',
              val === value && 'bg-primary border-primary text-black',
              disabled && ' cursor-not-allowed hover:bg-unset hover:text-unset',
              disabled && val !== value && 'opacity-50',
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
