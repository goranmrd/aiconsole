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
import { Agent, Asset, EditableObject, EditableObjectType, Material } from '@/types/editables/assetTypes';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { useEditableObjectContextMenu } from '@/utils/editables/useContextMenuForEditable';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { EditablesAPI } from '@/api/api/EditablesAPI';
import { Chat, ChatHeadline } from '@/types/editables/chatTypes';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { PinIconRotated } from '@/utils/editables/PinIconRotated';

const SideBarItem = ({
  editableObjectType,
  editableObject,
}: {
  editableObject: EditableObject;
  editableObjectType: EditableObjectType;
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const renameEditableObject = useEditablesStore((state) => state.renameEditableObject);
  const updateSelectedChat = useChatStore((state) => state.updateSelectedChat);
  const updateSelectedAsset = useAssetStore((state) => state.updateSelectedAsset);
  const updateChatItem = useEditablesStore((state) => state.updateChatItem);
  const updateMaterialsItem = useEditablesStore((state) => state.updateMaterialsItem);
  const updateAgentsItem = useEditablesStore((state) => state.updateAgentsItem);

  const [isEditing, setIsEditing] = useState(false);
  const [isShowingContext, setIsShowingContext] = useState(false);

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

  const handleRename = async () => {
    if (inputText === '') {
      setInputText(editableObject.name);
    } else {
      editableObject = {
        ...editableObject,
        name: inputText,
      };
      if (editableObjectType === 'chat') {
        const chat = await EditablesAPI.fetchEditableObject<ChatHeadline>({
          editableObjectType,
          id: editableObject.id,
        });
        editableObject = chat;
        updateChatItem(editableObject as Chat);
      }

      const newId = await renameEditableObject(editableObject, inputText, false);
      if (editableObjectType !== 'chat') {
        if (location.pathname === `/${editableObjectType}s/${editableObject.id}`) {
          navigate(`/${editableObjectType}s/${newId}`);
        }
        updateSelectedAsset(editableObject.name, newId);
        if (editableObjectType === 'material') {
          updateMaterialsItem(editableObject as Material);
        } else {
          updateAgentsItem(editableObject as Agent);
        }
      } else {
        updateSelectedChat(editableObject.name, newId);
      }
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
    forced = asset.status === 'forced';
    disabled = asset.status === 'disabled';

    if (forced) {
      extraStuff = (
        <div className="ml-auto items-center flex gap-[12px]">
          <PinIconRotated className={cn('w-[15px] h-[15px]  ')} />
        </div>
      );
    }
  }

  function handleContextMenu(event: MouseEvent) {
    setIsShowingContext(true);
    showContextMenu()(event);
  }

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
              editableObjectType === 'chat' && 'fill-chat bg-chat',
              editableObjectType === 'agent' && 'fill-agent bg-agent',
              editableObjectType === 'material' && 'fill-material bg-material',
              {
                block: false,
              },
            )}
          />
        </NavLink>
      </div>
    </div>
  );
};

export default SideBarItem;
