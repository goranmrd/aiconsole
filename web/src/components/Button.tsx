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

import { MouseEventHandler } from 'react';
import { cn } from '../utils/styles';

interface ButtonProps {
  label: string;
  variant?: 'primary' | 'danger' | 'secondary';
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={cn('rounded text-white px-4 py-1 outline-none', {
        'bg-green-700': variant === 'primary',
        'bg-red-700': variant === 'danger',
        'bg-blue-700': variant === 'secondary',
      })}
    >
      {label}
    </button>
  );
}
