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

import { useChatStore } from '@/project/editables/chat/store/useChatStore';
import { Asset, EditableObject, EditableObjectType } from '@/project/editables/assets/assetTypes';
import { Ban, Check, Copy, Dot, Edit, File, Trash } from 'lucide-react';
import { ContextMenuContent } from 'mantine-contextmenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { CONTEXT_MENU_ITEM_CLASSES, useContextMenu } from '../../common/contextMenu/useContextMenu';
import { useEditablesStore } from './useEditablesStore';

export function useEditableObjectContextMenu({
  editableObjectType,
  editableObject,
  setIsEditing,
}: {
  editableObjectType: EditableObjectType;
  editableObject?: EditableObject;
  setIsEditing?: (isEditing: boolean) => void;
}) {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();
  const navigate = useNavigate();
  const location = useLocation();
  const deleteEditableObject = useEditablesStore((state) => state.deleteEditableObject);

  function handleDelete(id: string) {
    if (!window.confirm(`Are you sure you want to delete this ${editableObjectType}?`)) {
      return;
    }

    deleteEditableObject(editableObjectType, id);

    if (editableObjectType === 'chat') {
      useChatStore.getState().setChatId(uuidv4());
    }
  }

  function showContextMenuReplacement() {
    const content: ContextMenuContent = [];

    if (!editableObject) {
      return () => {};
    }

    content.push({
      key: 'Name',
      title: editableObject.name,
      className: 'font-bold opacity-50 max-w-[400px] truncate !cursor-default hover:!bg-gray-700',
      disabled: true,
      onClick: () => {},
    });

    if (location.pathname !== `/${editableObjectType}s/${editableObject.id}`) {
      content.push({
        key: 'Open',
        icon: <File className="w-4 h-4" />,
        title: 'Open',
        onClick: () => {
          navigate(`/${editableObjectType}s/${editableObject.id}`);
        },
      });
    }

    content.push({
      key: 'Edit as New',
      icon: <Copy className="w-4 h-4" />,
      title: 'Edit as New',
      onClick: () => {
        navigate(`/${editableObjectType}s/${editableObjectType === 'chat' ? uuidv4() : 'new'}?copy=${editableObject.id}`);
      },
    });

    let hasDelete = true;

    if (editableObjectType == 'chat') {
      content.push(
        ...[
          {
            key: 'Rename',
            icon: <Edit className="w-4 h-4" />,
            title: 'Rename',
            hidden: !setIsEditing,
            onClick: () => {
              if (!setIsEditing) {
                return;
              }
              setIsEditing(true);
            },
          },
        ],
      );
    } else {
      const asset = editableObject as Asset;

      content.push(
        ...[
          ...(asset?.defined_in === 'project' && setIsEditing
            ? [
                {
                  key: 'Rename',
                  icon: <Edit className="w-4 h-4" />,
                  title: 'Rename',
                  onClick: () => {
                    setIsEditing(true);
                  },
                },
              ]
            : []),
          { key: 'divider' },
          {
            key: 'usage',
            icon: {
              enabled: <Dot className="w-4 h-4" />,
              disabled: <Ban className="w-4 h-4" />,
              forced: <Check className="w-4 h-4" />,
            }[asset?.status || 'enabled'],
            title: 'Use ...',

            items: [
              ...(editableObject && asset?.status !== 'forced'
                ? [
                    {
                      key: 'Always',
                      icon: <Check className="w-4 h-4" />,
                      title: 'Always',
                      className: CONTEXT_MENU_ITEM_CLASSES,
                      onClick: () => {
                        useEditablesStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'forced');
                      },
                    },
                  ]
                : []),
              ...(editableObject && asset?.status !== 'enabled'
                ? [
                    {
                      key: 'Auto',
                      icon: <Dot className="w-4 h-4" />,
                      title: 'Auto',
                      className: CONTEXT_MENU_ITEM_CLASSES,
                      onClick: () => {
                        useEditablesStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'enabled');
                      },
                    },
                  ]
                : []),
              ...(editableObject && asset?.status !== 'disabled'
                ? [
                    {
                      key: 'Disabled',
                      icon: <Ban className="w-4 h-4" />,
                      title: 'Disabled',
                      className: CONTEXT_MENU_ITEM_CLASSES,
                      onClick: () => {
                        useEditablesStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'disabled');
                      },
                    },
                  ]
                : []),
            ],
          },
          { key: 'divider2' },
        ],
      );

      hasDelete = asset?.defined_in === 'project';
    }

    if (hasDelete) {
      content.push({
        key: 'Delete',
        icon: <Trash className="w-4 h-4" />,
        title: 'Delete',
        onClick: () => handleDelete(editableObject.id),
      });
    }

    return showContextMenu(content);
  }
  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
