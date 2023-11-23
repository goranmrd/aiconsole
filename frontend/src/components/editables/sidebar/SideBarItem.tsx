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

import { cn } from '@/utils/common/cn';
import { Asset, EditableObject, EditableObjectType } from '@/types/editables/assetTypes';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { EditablesAPI } from '@/api/api/EditablesAPI';
import { Chat } from '@/types/editables/chatTypes';
import { MoreVertical } from 'lucide-react';
import { useAssets } from '@/utils/editables/useAssets';
import { convertNameToId } from '@/utils/editables/convertNameToId';
import { useChat } from '@/utils/editables/useChat';
import showNotification from '@/utils/common/showNotification';

const SideBarItem = ({
  editableObjectType,
  editableObject,
}: {
  editableObject: EditableObject;
  editableObjectType: EditableObjectType;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isShowingContext, setIsShowingContext] = useState(false);
  const [blockBlur, setBlockBlur] = useState(false);

  const { renameAsset } = useAssets(editableObjectType);
  const { showContextMenu, isContextMenuVisible } = useEditableObjectContextMenu({
    editableObjectType: editableObjectType,
    editable: editableObject,
    setIsEditing,
  });

  useEffect(() => {
    if (!isContextMenuVisible) {
      setIsShowingContext(false);
    }
  }, [isContextMenuVisible]);

  const Icon = getEditableObjectIcon(editableObject);

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

  const { renameChat } = useChat();

  const handleRename = async () => {
    const previousObjectId = editableObject.id;
    if (inputText === '' || editableObject.name === inputText) {
      setInputText(editableObject.name);
    } else {
      const newId = convertNameToId(inputText);
      editableObject = {
        ...editableObject,
        id: newId,
        name: inputText,
      };

      if (editableObjectType === 'chat') {
        const chat = await EditablesAPI.fetchEditableObject<Chat>({
          editableObjectType,
          id: previousObjectId,
        });
        editableObject = { ...chat, name: inputText, title_edited: true } as Chat;
        await renameChat(editableObject as Chat);
        if (location.pathname !== `/${editableObjectType}s/${chat.id}`) {
          navigate(`/${editableObjectType}s/${chat.id}`);
        }
      } else {
        await renameAsset(previousObjectId, editableObject as Asset);
        if (location.pathname === `/${editableObjectType}s/${previousObjectId}`) {
          navigate(`/${editableObjectType}s/${newId}`);
        }
      }
      showNotification({
        title: 'Renamed',
        message: 'renamed',
        variant: 'success',
      });
    }
    hideInput();
  };

  const handleBlur = () => {
    // when onKeyDown event was emitted input was losing focus and blur event was fired to - this blocker prevent this situation
    if (blockBlur) {
      setBlockBlur(false);
      return;
    }

    handleRename();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Escape') {
      setInputText(editableObject.name);
      hideInput();
      setBlockBlur(true);
    }

    if (event.code === 'Enter') {
      setBlockBlur(true);
      handleRename();
    }
  };

  let forced = false;
  let disabled = false;

  if (editableObjectType === 'agent' || editableObjectType === 'material') {
    const asset: Asset = editableObject as Asset;
    forced = asset.status === 'forced';
    disabled = asset.status === 'disabled';
  }

  function handleContextMenu(event: MouseEvent) {
    setIsShowingContext(true);
    showContextMenu()(event);
  }

  const handleMoreIconClick = (event: MouseEvent) => {
    event.stopPropagation();
    handleContextMenu(event);
  };

  return (
    <div ref={popoverRef} onContextMenu={handleContextMenu} className="max-w-[275px]">
      <div
        className={cn(
          forced && editableObjectType === 'agent' && 'text-agent',
          forced && editableObjectType === 'material' && 'text-material',
          disabled && 'opacity-50',
        )}
      >
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
          {({ isActive }) => (
            <>
              <Icon
                className={cn(
                  'min-w-[24px] min-h-[24px] w-[24px] h-[24px]',
                  editableObjectType === 'chat' && 'text-chat',
                  editableObjectType === 'agent' && 'text-agent',
                  editableObjectType === 'material' && 'text-material',
                )}
              />
              {/* TODO: add validation for empty input value */}
              {isEditing ? (
                <input
                  className="font-normal outline-none border h-[24px] border-gray-400 text-[14px] p-[5px] w-full text-white bg-gray-600 focus:border-primary resize-none overflow-hidden rounded-[4px]  focus:outline-none"
                  value={inputText}
                  ref={inputRef}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setInputText(e.target.value)}
                />
              ) : (
                <p className="text-[14px] leading-[18.2px] group-hover:text-white truncate">{editableObject.name}</p>
              )}
              <div className="flex gap-[10px] ml-auto items-center">
                <MoreVertical
                  className={cn(
                    'w-4 h-4 min-h-[16px] min-w-[16px] ml-auto hidden group-hover:text-white group-hover:block',
                    {
                      block: isShowingContext,
                    },
                  )}
                  onClick={handleMoreIconClick}
                />
              </div>
              <div
                className={cn(
                  'absolute bottom-[-15px] hidden left-[0px] opacity-[0.3] blur-[10px]  h-[34px] w-[34px] group-hover:block',
                  editableObjectType === 'chat' && 'fill-chat bg-chat',
                  editableObjectType === 'agent' && 'fill-agent bg-agent',
                  editableObjectType === 'material' && 'fill-material bg-material',
                  {
                    block: isActive,
                  },
                )}
              />
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default SideBarItem;
