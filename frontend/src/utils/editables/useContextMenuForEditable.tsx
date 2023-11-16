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

import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Asset, AssetStatus, EditableObject, EditableObjectType } from '@/types/editables/assetTypes';
import { Copy, Edit, File, Trash, Undo2 } from 'lucide-react';
import { ContextMenuContent } from 'mantine-contextmenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useContextMenu } from '../common/useContextMenu';
import { getAssetStatusIcon } from './getAssetStatusIcon';
import { useDeleteEditableObjectWithUserInteraction } from './useDeleteEditableObjectWithUserInteraction';

function createIconForStatus(assetStatus: AssetStatus) {
  const Icon = getAssetStatusIcon(assetStatus);
  return <Icon className="w-4 h-4" />;
}

export const DISABLED = 'font-bold opacity-50 max-w-[400px] truncate !cursor-default hover:!bg-gray-700';

export function useEditableObjectContextMenu({
  editableObjectType,
  editable: editableObject,
  setIsEditing,
}: {
  editableObjectType: EditableObjectType;
  editable?: EditableObject;
  setIsEditing?: (isEditing: boolean) => void;
}) {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();

  const navigate = useNavigate();
  const location = useLocation();
  const handleDelete = useDeleteEditableObjectWithUserInteraction(editableObjectType);

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
        navigate(
          `/${editableObjectType}s/${editableObjectType === 'chat' ? uuidv4() : 'new'}?copy=${editableObject.id}`,
        );
      },
    });

    let hasDelete = true;
    let isDeleteRevert = false;

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
      hasDelete = asset?.defined_in === 'project';
      isDeleteRevert = asset?.override;

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
            title: 'Change Use to ...',
            className: DISABLED,
            disabled: true,
            onClick: () => {},
          },
          ...(editableObject && asset?.status !== 'forced'
            ? [
                {
                  key: 'Always',
                  icon: createIconForStatus('forced'),
                  title: 'Always',
                  onClick: () => {
                    useAssetStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'forced');
                  },
                },
              ]
            : []),
          ...(editableObject && asset?.status !== 'enabled'
            ? [
                {
                  key: 'Reset',
                  icon: createIconForStatus('enabled'),
                  title: 'Reset',
                  onClick: () => {
                    useAssetStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'enabled');
                  },
                },
              ]
            : []),
          ...(editableObject && asset?.status !== 'disabled'
            ? [
                {
                  key: 'Disabled',
                  icon: createIconForStatus('disabled'),
                  title: 'Disabled',
                  onClick: () => {
                    useAssetStore.getState().setAssetStatus(editableObjectType, editableObject.id, 'disabled');
                  },
                },
              ]
            : []),
        ],
      );
    }

    if (hasDelete) {
      content.push({ key: 'divider-delete' });
      content.push({
        key: 'Delete',
        icon: isDeleteRevert ? <Undo2 className="w-4 h-4" /> : <Trash className="w-4 h-4" />,
        title: isDeleteRevert ? 'Revert' : 'Delete',
        onClick: () => handleDelete(editableObject.id),
      });
    }

    return showContextMenu(content);
  }
  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
