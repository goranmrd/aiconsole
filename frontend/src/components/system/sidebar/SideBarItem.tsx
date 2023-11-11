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
import { LucideIcon } from 'lucide-react';
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface SideBarItemProps {
  label: string;
  onRename?: (value: string) => void;
  linkTo: string;
  onContextMenu?: (event: MouseEvent) => void;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  icon: LucideIcon;
  color: string;
  children?: React.ReactNode;
}

const SideBarItem = ({
  isEditing,
  setIsEditing,
  label,
  onRename,
  linkTo,
  onContextMenu,
  icon: Icon,
  color,
  children,
}: SideBarItemProps) => {
  const [inputText, setInputText] = useState(label);

  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setInputText(label);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isEditing, label, setIsEditing]);

  const hideInput = () => {
    setIsEditing(false);
  };

  const handleRename = () => {
    if (inputText === '') {
      setInputText(label);
    } else {
      onRename?.(inputText);
    }
    hideInput();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      setInputText(label);
      hideInput();
    }

    if (event.code === 'Enter') {
      handleRename();
    }
  };

  return (
    <div ref={popoverRef} onContextMenu={onContextMenu}>
      <div>
        <NavLink
          className={({ isActive, isPending }) => {
            return cn(
              'group flex items-center gap-[12px] overflow-hidden p-[9px] rounded-[8px] cursor-pointer relative  hover:bg-gray-700',
              {
                'bg-gray-700 text-white ': isActive || isPending,
              },
            );
          }}
          to={linkTo}
        >
          <Icon className="min-w-[24px] min-h-[24px] w-[24px] h-[24px] " style={{ color }} />
          {/* TODO: add validation for empty input value */}
          {isEditing ? (
            <input
              className="font-normal outline-none border h-[24px] border-gray-400 text-[14px] p-[5px] w-full text-white bg-gray-600 focus:border-primary resize-none overflow-hidden rounded-[4px]  focus:outline-none"
              value={inputText}
              ref={inputRef}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              onChange={(e) => setInputText(e.target.value)}
            />
          ) : (
            <p className="text-[14px] leading-[18.2px] group-hover:text-white truncate">{label}</p>
          )}
          {!isEditing ? <div className="ml-auto items-center flex gap-[12px]">{children}</div> : null}

          <div
            className={cn(
              'absolute bottom-[-15px] hidden left-[0px] opacity-[0.3] blur-[10px]  h-[34px] w-[34px] group-hover:block',
              {
                block: false,
              },
            )}
            style={{ background: color, fill: color }}
          />
        </NavLink>
      </div>
    </div>
  );
};

export default SideBarItem;
