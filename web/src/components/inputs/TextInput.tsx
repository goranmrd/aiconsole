import { ChangeEvent } from 'react';

import { cn } from '@/utils/styles';

interface SimpleInputProps {
  label: string;
  value: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleInput({
  label,
  value,
  className,
  onChange,
  placeholder,
  disabled = false,
}: SimpleInputProps) {
  return (
    <>
      <label htmlFor={label} className="font-bold">
        {label}:
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
