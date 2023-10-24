import { ChangeEvent } from 'react';

import { cn } from '@/utils/styles';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../Tooltip';

interface SimpleInputProps {
  label: string;
  value: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  withTooltip?: boolean;
  tootltipText?: string;
}

export function SimpleInput({
  label,
  value,
  className,
  onChange,
  placeholder,
  disabled = false,
  withTooltip = false,
  tootltipText,
}: SimpleInputProps) {
  return (
    <>
      <label
        htmlFor={label}
        className="font-bold flex items-center gap-1 w-fit-content"
      >
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
      <textarea
        disabled={disabled}
        placeholder={placeholder}
        id={label}
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e.target.value);
        }}
        className={cn(
          className,
          'resize-none flex-none h-10 bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:shadow-outline',
          {
            'opacity-[0.7]': disabled,
          },
        )}
      ></textarea>
    </>
  );
}
