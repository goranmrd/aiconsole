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

import { MouseEvent, useRef, useState, KeyboardEvent, useMemo } from 'react';
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
import { Api } from '@/api/Api';
import { useAICStore } from '@/store/AICStore';
import { showNotification } from '@mantine/notifications';

const CURSOR_POPOVER_GAP = 40;

const getItemData = (type: TabsValues) => {
  switch (type) {
    case 'materials':
      return {
        icon: Grid2X2,
        color: '#CFA740',
        text: 'Materials',
      };
    case 'agents':
      return {
        icon: Bot,
        color: '#62ADF2',
        text: 'Agents',
      };
    default:
    case 'chats':
      return {
        icon: MessageSquare,
        color: '#A67CFF',
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
  id: string;
  active: boolean;
  onDelete?: (event: MouseEvent) => void;
  onRename?: (value: string) => void;
  onDuplicate?: (event: MouseEvent) => void;
  onClick?: (event: MouseEvent) => void;
  status?: MaterialStatus;
}

const SideBarItem = ({
  type,
  label,
  status = 'disabled',
  active,
  id,
  onDelete,
  onDuplicate,
  onRename,
  onClick,
}: SideBarItemProps) => {
  const [opened, setOpened] = useState(false);
  const [offset, setOffset] = useState<FloatingAxesOffsets>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [inputText, setInputText] = useState(label);
  const [currentStatus, setCurrentStatus] = useState(status);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { icon: Icon, color } = getItemData(type);

  const StatusIcon = useMemo(
    () => getMaterialStatusIcon(currentStatus),
    [currentStatus],
  );

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setOpened((open) => !open);
    if (!popoverRef?.current) return;
    const rect = popoverRef.current.getBoundingClientRect();
    const crossAxis = e.clientX - rect.x - CURSOR_POPOVER_GAP;
    const mainAxis = e.clientY - rect.y - CURSOR_POPOVER_GAP;
    setOffset({ mainAxis, crossAxis });
  };

  const showRenameInput = () => {
    setIsEditMode(true);
    setInputText(label);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  const hideInput = () => {
    setIsEditMode(false);
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

  const updateMaterialStatus = async (event: MouseEvent) => {
    event.stopPropagation();
    switch (currentStatus) {
      case 'disabled':
        setCurrentStatus('enabled');
        break;
      case 'enabled':
        setCurrentStatus('forced');
        break;
      case 'forced':
        setCurrentStatus('disabled');
        break;
      default:
        setCurrentStatus(status);
    }

    await Api.setMaterialStatus(id, status);
    await useAICStore.getState().fetchMaterials();

    showNotification({
      title: 'Status changed',
      message: `Material status changed to ${currentStatus}`,
      variant: 'success',
    });
  };

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
              className="min-w-[24px] min-h-[24px] w-[24px] h-[24px] "
              style={{ color }}
            />
            {/* TODO: add validation for empty input value */}
            {isEditMode ? (
              <input
                className="font-normal outline-none border h-[24px] border-gray-400 text-[14px] p-[5px] w-full text-white bg-gray-600 focus:border-primary resize-none overflow-hidden rounded-[4px]  focus:outline-none"
                value={inputText}
                ref={inputRef}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                onChange={(e) => setInputText(e.target.value)}
              />
            ) : (
              <p className="text-[14px] leading-[18.2px] group-hover:text-white truncate">
                {label}
              </p>
            )}
            {!isEditMode ? (
              <div className="ml-auto items-center flex gap-[12px]">
                {type === 'materials' ? (
                  <StatusIcon
                    onClick={updateMaterialStatus}
                    className={cn('w-[15px] h-[15px]  text-gray-300 ', {
                      'text-gray-500': status === 'disabled',
                    })}
                  />
                ) : null}
                <div className="w-[20px] h-[20px] ">
                  <MoreVertical className="w-full h-full text-gray-300 hidden group-hover:block" />
                </div>
              </div>
            ) : null}

            <div
              className={cn(
                'absolute bottom-[-15px] hidden left-[0px] opacity-[0.3] blur-[10px]  h-[34px] w-[34px] group-hover:block',
                {
                  block: active,
                },
              )}
              style={{ background: color, fill: color }}
            />
          </div>
        </Menu.Target>

        <Menu.Dropdown>
          {onRename ? (
            <Menu.Item
              leftSection={
                <Pencil className="text-gray-400 w-[16px] h-[16px]" />
              }
              onClick={showRenameInput}
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
