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

import { MaterialStatus, TabsValues } from '@/types/types';
import { cn } from '@/utils/styles';
import {
  MessageSquare,
  Ban,
  MoreVertical,
  Bot,
  Grid2X2,
  Play,
  CircleDot,
  Pencil,
  Copy,
  Trash,
} from 'lucide-react';
import { FloatingAxesOffsets, Menu } from '@mantine/core';
import { MouseEvent, useRef, useState } from 'react';

const CURSOR_POPOVER_GAP = 40;

const getItemData = (type: TabsValues) => {
  switch (type) {
    case 'materials':
      return {
        icon: Grid2X2,
        color: 'orange-400',

        text: 'Materials',
      };
    case 'agents':
      return {
        icon: Bot,
        color: 'blue-400',
        text: 'Agents',
      };
    default:
    case 'chats':
      return {
        icon: MessageSquare,
        color: 'primary',
        text: 'Chats',
      };
  }
};

const getMaterialStatusIcon = (status?: MaterialStatus) => {
  switch (status) {
    case 'forced':
      return CircleDot;
    case 'enabled':
      return Play;
    default:
    case 'disabled':
      return Ban;
  }
};

interface SideBarItemProps {
  type: TabsValues;
  label: string;
  active: boolean;
  editable?: boolean;
  status?: MaterialStatus;
  onDelete?: (event: MouseEvent) => void;
  onRename?: (event: MouseEvent) => void;
  onDuplicate?: (event: MouseEvent) => void;
  onClick?: (event: MouseEvent) => void;
}

const SideBarItem = ({
  type,
  label,
  status = 'disabled',
  active,
  onDelete,
  onDuplicate,
  onRename,
  onClick,
}: SideBarItemProps) => {
  const [opened, setOpened] = useState(false);
  const [offset, setOffset] = useState<FloatingAxesOffsets>({});
  const popoverRef = useRef<HTMLDivElement>(null);

  const { icon: Icon, color } = getItemData(type);
  const StatusIcon = getMaterialStatusIcon(status);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setOpened((open) => !open);
    if (!popoverRef?.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const crossAxis = e.clientX - rect.x - CURSOR_POPOVER_GAP;
    const mainAxis = e.clientY - rect.y - CURSOR_POPOVER_GAP;
    setOffset({ mainAxis, crossAxis });
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [inputText, setInputText] = useState('');

  const editLabel = (message: string) => {
    setIsEditMode(true);
    setInputText(message);
  };

  const OnAccept = (chatId: string) => {
    // onHeadlineChange(chatId, inputText);
    setIsEditMode(false);
  };

  //  <Check className="h-4 w-4" onClick={() => OnAccept(chat.id)} />
  //                 <X className="h-4 w-4" onClick={() => setIsEditMode(false)} />
  return (
    <div ref={popoverRef}>
      <Menu
        opened={opened}
        offset={offset}
        width={137}
        onChange={() => setOpened(false)}
        classNames={{
          dropdown: '!bg-gray-700 border !border-gray-800 !px-0 !py-[6px]',
          item: '!text-white !bg-gray-700 hover:!bg-gray-600 !py-[7px] !px-[15px] !rounded-none my-[3px] !text-[16px]',
          divider: '!border-gray-800',
        }}
      >
        <Menu.Target>
          <div
            className={cn(
              'group flex p-[9px] items-center rounded-[8px] hover:bg-gray-700 cursor-pointer relative overflow-hidden gap-[12px]',
              {
                'bg-gray-700 text-white': active,
              },
            )}
            onClick={onClick}
            onContextMenu={handleContextMenu}
          >
            <Icon
              className={`min-w-[24px] min-h-[24px] w-[24px] h-[24px] text-${color}`}
            />
            {isEditMode && active ? (
              <input
                className="font-normal outline-1 outline-white/20 ring-secondary/30 bg-black resize-none overflow-hidden rounded-lg outline focus:outline-none focus:ring-2"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            ) : (
              <p
                className="text-[14px] leading-[18.2px] group-hover:text-white truncate"
                onClick={() => editLabel(label)}
              >
                {label}
              </p>
            )}
            <div className="ml-auto items-center flex gap-[12px]">
              {type === 'materials' ? (
                <StatusIcon
                  className={cn('w-[15px] h-[15px]  text-gray-300 ', {
                    'text-gray-500': status === 'disabled',
                  })}
                />
              ) : null}
              <div className="w-[20px] h-[20px] ">
                <MoreVertical className="w-full h-full text-gray-300 hidden group-hover:block" />
              </div>
            </div>
            <div
              className={cn(
                `absolute bottom-[-15px] hidden left-[0px] opacity-[0.3] blur-[10px] bg-${color} fill-${color} h-[34px] w-[34px] group-hover:block `,
                {
                  block: active,
                },
              )}
            />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          {onRename ? (
            <Menu.Item
              leftSection={
                <Pencil className="text-gray-400 w-[16px] h-[16px]" />
              }
              onClick={onRename}
            >
              Rename
            </Menu.Item>
          ) : null}
          {onDuplicate ? (
            <Menu.Item
              leftSection={<Copy className="text-gray-400 w-[16px] h-[16px]" />}
              onClick={onDuplicate}
            >
              Duplicate
            </Menu.Item>
          ) : null}
          {(onDuplicate || onRename) && onDelete ? (
            <Menu.Divider className="!my-[5px]" />
          ) : null}
          {onDelete ? (
            <Menu.Item
              leftSection={
                <Trash className="text-gray-400 w-[16px] h-[16px]" />
              }
              onClick={onDelete}
            >
              Delete
            </Menu.Item>
          ) : null}
        </Menu.Dropdown>
      </Menu>
    </div>
  );
};

export default SideBarItem;
