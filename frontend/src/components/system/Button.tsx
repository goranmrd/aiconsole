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

import { MouseEventHandler, ReactNode } from 'react';
import { cn } from '../../utils/styles';

type StatusColor = 'green' | 'red' | 'purple' | 'base';

const getStatusColor = (statusColor?: StatusColor) => {
  switch (statusColor) {
    case 'green':
      return ' border-success text-gray-300 [&>svg]:text-success bg-gray-700 focus:border-success hover:border-success focus:bg-gray-700 hover:bg-gray-700 [&>svg]:hover:text-success [&>svg]:focus:text-success';
    case 'red':
      return 'border-danger text-gray-300 [&>svg]:text-danger bg-gray-700 focus:border-danger hover:border-danger focus:bg-gray-700 hover:bg-gray-700 [&>svg]:hover:text-danger [&>svg]:focus:text-danger';
    case 'purple':
      return 'border-primary text-gray-300 [&>svg]:text-primary bg-gray-700';
    default:
      return 'border-gray-500 text-white [&>svg]:text-white bg-gray-700';
  }
};

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'status';
  statusColor?: StatusColor; // works only with variant === 'status'
  disabled?: boolean;
  fullWidth?: boolean;
  iconOnly?: boolean;
  small?: boolean;
  bold?: boolean;
  classNames?: string;
  dataAutofocus?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
  onContextMenu?: MouseEventHandler<HTMLButtonElement>;
}

export function Button({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  variant = 'primary',
  fullWidth,
  iconOnly,
  disabled,
  small,
  statusColor,
  bold,
  classNames,
  dataAutofocus,
  onContextMenu,
}: ButtonProps) {
  const getVariant = () => {
    switch (variant) {
      case 'primary':
        return 'bg-secondary text-gray-900';
      case 'secondary':
        return 'bg-gray-800 border-gray-400 text-gray-300 hover:border-secondary hover:text-secondary font-normal text-[15px] focus:border-secondary';
      case 'tertiary':
        return 'bg-transparent border-transparent text-gray-300 hover:border-transparent hover:text-secondary hover:bg-transparent font-normal text-[15px] focus:bg-transparent px-0';
      case 'status':
        return `!px-[14px] !py-[13px] max-h-[48px] bg-gray-800 border-gray-500 text-gray-300 [&>svg]:text-gray-500 font-normal text-[15px] hover:text-gray-300 hover:border-gray-300 hover:bg-gray-800 [&>svg]:hover:text-gray-300 [&>svg]:focus:text-gray-300 [&>svg]:transition-colors [&>svg]:duration-200 focus:border-gray-300 focus:text-gray-300 focus:bg-gray-800 ${getStatusColor(
          statusColor,
        )}`;
      default:
        'primary';
    }
  };
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
      data-autofocus={dataAutofocus}
      className={cn(
        'rounded-[36px]  px-[30px] py-[20px] outline-none w-[fit-content]  font-semibold flex items-center justify-center gap-2 max-h-[60px] border border-secondary button hover:bg-gray-600 hover:text-secondary  transition-colors duration-200 focus:bg-gray-600 focus:text-secondary',
        getVariant(),
        {
          'w-full': fullWidth,
          'p-[18px] button-icon-only max-w-[60px]': iconOnly,
          'px-[20px] py-[14.5px] max-h-[48px]': small,
          'p-[12px] max-h-[48px]': small && iconOnly,
          'bg-gray-700 border-gray-500  text-gray-500 cursor-not-allowed hover:border-gray-500 hover:bg-gray-700 hover:text-gray-500 focus:bg-gray-700 focus:border-gray-500 focus:text-gray-500 [&>svg]:text-gray-500 [&>svg]:hover:text-gray-500 [&>svg]focus:text-white pointer-events-none':
            disabled,
          'font-semibold': bold,
        },
        classNames,
      )}
    >
      {children}
    </button>
  );
}
