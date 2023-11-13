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

import { cn } from '@/common/cn';
import { Asset, EditableObject, EditableObjectType } from '@/project/editables/chat/assetTypes';
import { getEditableObjectColor } from '@/project/editables/getEditableObjectColor';
import { getEditableObjectIcon } from '@/project/editables/getEditableObjectIcon';
import { useEditableObjectContextMenu } from '@/project/editables/useEditableObjectContextMenu';
import { useEditablesStore } from '@/project/editables/store/useEditablesStore';
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getAssetStatusIcon } from '../../editables/assets/getAssetStatusIcon';

const SideBarItem = ({
  editableObjectType,
  editableObject,
}: {
  editableObject: EditableObject;
  editableObjectType: EditableObjectType;
}) => {
  const renameEditableObject = useEditablesStore((state) => state.renameEditableObject);

  const [isEditing, setIsEditing] = useState(false);
  const [isShowingContext, setIsShowingContext] = useState(false);

  const { showContextMenu, isContextMenuVisible } = useEditableObjectContextMenu({
    editableObjectType: editableObjectType,
    editableObject: editableObject,
    setIsEditing,
  });

  useEffect(() => {
    if (!isContextMenuVisible) {
      setIsShowingContext(false);
    }
  }, [isContextMenuVisible]);

  const Icon = getEditableObjectIcon(editableObject);
  const color = getEditableObjectColor(editableObject);

  const [inputText, setInputText] = useState(editableObject.name);

  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setInputText(editableObject.name);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isEditing, editableObject.name, setIsEditing]);

  const hideInput = () => {
    setIsEditing(false);
  };

  const handleRename = () => {
    if (inputText === '') {
      setInputText(editableObject.name);
    } else {
      renameEditableObject(editableObject, inputText, false);
    }
    hideInput();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      setInputText(editableObject.name);
      hideInput();
    }

    if (event.code === 'Enter') {
      handleRename();
    }
  };

  let extraStuff = null;
  let forced = false;
  let disabled = false;

  if (editableObjectType === 'agent' || editableObjectType === 'material') {
    const asset: Asset = editableObject as Asset;
    const StatusIcon = getAssetStatusIcon(asset.status);
    forced = asset.status === 'forced';
    disabled = asset.status === 'disabled';

    extraStuff = (
      <div className="ml-auto items-center flex gap-[12px]">
        <StatusIcon
          className={cn('w-[15px] h-[15px]  ')}
        />
      </div>
    );
  }

  function handleContextMenu(event: MouseEvent) {
    setIsShowingContext(true);
    showContextMenu()(event);
  }

  return (
    <div ref={popoverRef} onContextMenu={handleContextMenu}>
      <div className={cn(forced && "text-primary", disabled && "opacity-50")}>
        <NavLink
          className={({ isActive, isPending }) => {
            return cn(
              'group flex items-center gap-[12px] overflow-hidden p-[9px] rounded-[8px] cursor-pointer relative  hover:bg-gray-700',
              {
                'bg-gray-700 text-white ': isActive || isPending || isShowingContext,
              },
            );
          }}
          to={`/${editableObjectType}s/${editableObject.id}`}
        >
          <Icon className="min-w-[24px] min-h-[24px] w-[24px] h-[24px]" style={{ color }} />
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
            <p className="text-[14px] leading-[18.2px] group-hover:text-white truncate">{editableObject.name}</p>
          )}
          {!isEditing ? extraStuff : null}

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
