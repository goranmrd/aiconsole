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
  render: (value: T) => React.ReactNode;
}

export function EnumInput<T extends string>({
  label,
  value,
  values,
  onChange,
  render,
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
              'bg-white/5 border border-white/10 hover:text-black text-sm hover:bg-primary-light px-3 py-1 rounded-full flex flex-row items-center gap-1',
              val === value && 'bg-primary border-primary text-black',
              disabled && ' cursor-not-allowed hover:bg-unset hover:text-unset',
              disabled && val !== value && 'opacity-50',
            )}
            onClick={() => onChange(val)}
            key={val}
          >
            {render(val)}
          </button>
        ))}
      </div>
    </div>
  );
}
