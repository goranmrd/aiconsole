import { ChangeEvent } from 'react';
import { cn } from '@/utils/styles';

const REQUIRED_ERROR_MESSAGE = 'This field is required.';

export type ErrorObject = {
  [key: string]: string | null;
};

interface SimpleInputProps {
  label: string;
  value: string;
  name: string;
  className?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  errors?: ErrorObject;
  setErrors?: React.Dispatch<React.SetStateAction<ErrorObject>>;
}

export function SimpleInput({
  label,
  value,
  className,
  onChange,
  placeholder,
  disabled = false,
  required,
  name,
  errors,
  setErrors,
}: SimpleInputProps) {
  const checkIfEmpty = (value: string) => {
    if (required && value.trim() === '') {
      setErrors?.((prevErrors) => ({
        ...prevErrors,
        ...{ [name]: REQUIRED_ERROR_MESSAGE },
      }));
    } else {
      setErrors?.((prevErrors) => ({
        ...prevErrors,
        ...{ [name]: null },
      }));
    }
  };

  const error = errors?.[name];

  const handleBlur = (e: ChangeEvent<HTMLTextAreaElement>) => {
    checkIfEmpty(e.target.value);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    checkIfEmpty(e.target.value);
  };

  return (
    <div className="relative">
      <label htmlFor={label} className="font-bold">
        {label}:
      </label>
      <textarea
        disabled={disabled}
        placeholder={placeholder}
        id={label}
        value={value}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          className,
          'resize-none flex-none h-10 bg-black/20 appearance-none border border-transparent rounded w-full py-2 px-3 leading-tight placeholder-gray-400 focus:outline-none focus:border-primary/50 focus:shadow-outline mt-1',
          {
            'opacity-[0.7] cursor-not-allowed': disabled,
            'border-red-700 focus:border-red-700': error,
          },
        )}
      ></textarea>
      {error && (
        <div className="text-red-700 text-sm absolute right-0">{error}</div>
      )}
    </div>
  );
}
