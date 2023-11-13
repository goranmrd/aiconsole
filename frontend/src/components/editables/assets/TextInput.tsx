// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ChangeEvent } from 'react';
import { cn } from '@/utils/common/cn';
import { Tooltip } from '@/components/common/Tooltip';

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
  required,
  name,
  errors,
  setErrors,
  withTooltip = false,
  tootltipText,
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

  const core = (
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
  );

  return (
    <div className="relative">
      <label
        htmlFor={label}
        className="font-bold flex items-center gap-1 w-fit-content"
      >
        {label}:
      </label>
      { withTooltip ? (
      <Tooltip label={tootltipText} position="top-end" offset={{ mainAxis: 7 }}>
        {core}
      </Tooltip>
      ) : ( core ) }
      {error && (
        <div className="text-red-700 text-sm absolute right-0">{error}</div>
      )}
    </div>
  );
}
