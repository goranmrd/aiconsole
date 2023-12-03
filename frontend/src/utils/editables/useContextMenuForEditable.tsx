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
import { Asset, AssetStatus, AssetType, EditableObject, EditableObjectType } from '@/types/editables/assetTypes';
import { Circle, Copy, Edit, File, FolderOpenIcon, Trash, Undo2 } from 'lucide-react';
import { ContextMenuContent } from 'mantine-contextmenu';
import { useLocation, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useContextMenu } from '../common/useContextMenu';
import { useDeleteEditableObjectWithUserInteraction } from './useDeleteEditableObjectWithUserInteraction';
import { useMemo } from 'react';
import { RadioCheckedIcon } from '@/components/common/icons/RadioCheckedIcon';
import { noop } from '../common/noop';
import { useEditablesStore } from '@/store/editables/useEditablesStore';

export const DISABLED_CSS_CLASSES = 'max-w-[400px] truncate !text-gray-400 pointer-events-none !cursor-default ';

const statusHelper = (status: AssetStatus, editableObject: Asset, editableObjectType: AssetType) => {
  const handleClick = (status: AssetStatus) => () => {
    useAssetStore.getState().setAssetStatus(editableObjectType, editableObject.id, status);
  };

  const assetStatusIcon = (itemStatus: AssetStatus) => {
    if ((editableObject as Asset)?.status === itemStatus) {
      return <RadioCheckedIcon classNames="w-4 h-4" />;
    }

    return <Circle className="w-4 h-4" />;
  };

  return {
    className: editableObject.status === status ? DISABLED_CSS_CLASSES : '!text-white',
    disabled: editableObject.status === status,
    icon: assetStatusIcon(status),
    hidden: !editableObject,
    onClick: editableObject.status === status ? noop : handleClick(status),
  };
};

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
  const hasDelete = useMemo(
    () => (editableObjectType === 'chat' ? true : (editableObject as Asset)?.defined_in === 'project'),
    [editableObject, editableObjectType],
  );
  const isDeleteRevert = useMemo(
    () => (editableObjectType === 'chat' ? false : (editableObject as Asset)?.override),
    [editableObject, editableObjectType],
  );
  const navigate = useNavigate();
  const location = useLocation();
  const handleDelete = useDeleteEditableObjectWithUserInteraction(editableObjectType);
  const canOpenFinderForEditable = useEditablesStore((state) => state.canOpenFinderForEditable);
  const openFinderForEditable = useEditablesStore((state) => state.openFinderForEditable);

  function showContextMenuReplacement() {
    if (!editableObject) {
      return noop;
    }

    const assetItems = () => {
      if (editableObjectType === 'chat') return [];
      const asset = editableObject as Asset;

      return [
        { key: 'divider' },
        {
          key: 'usage',
          title: 'Usage',
          className: DISABLED_CSS_CLASSES,
          disabled: true,
          onClick: noop,
        },

        {
          key: 'enforced',
          title: 'Enforced',
          ...statusHelper('forced', asset, editableObjectType),
        },

        {
          key: 'ai choice',
          title: 'AI Choice',
          ...statusHelper('enabled', asset, editableObjectType),
        },

        {
          key: 'Disabled',
          title: 'Disabled',
          ...statusHelper('disabled', asset, editableObjectType),
        },
      ];
    };

    const content: ContextMenuContent = [
      {
        key: 'Rename',
        icon: <Edit className="w-4 h-4" />,
        title: 'Rename',
        hidden: !setIsEditing || (editableObject as Asset)?.defined_in === 'aiconsole',
        onClick: () => {
          if (!setIsEditing) {
            return;
          }
          setIsEditing(true);
        },
      },
      {
        key: 'Duplicate',
        icon: <Copy className="w-4 h-4" />,
        title: 'Duplicate',
        onClick: () => {
          navigate(
            `/${editableObjectType}s/${editableObjectType === 'chat' ? uuidv4() : 'new'}?copy=${editableObject.id}`,
          );
        },
      },
      {
        key: 'Open',
        icon: <File className="w-4 h-4" />,
        title: 'Open',
        hidden: location.pathname === `/${editableObjectType}s/${editableObject.id}`,
        onClick: () => {
          navigate(`/${editableObjectType}s/${editableObject.id}`);
        },
      },
      {
        key: 'reveal',
        icon: <FolderOpenIcon className="w-4 h-4" />,
        title: `Reveal in ${window.window?.electron?.getFileManagerName()}`,
        hidden: !canOpenFinderForEditable(editableObject),
        onClick: () => {
          openFinderForEditable(editableObject);
        },
      },

      ...assetItems(),
      { key: 'divider-delete', hidden: !hasDelete },
      {
        key: 'Delete',
        icon: isDeleteRevert ? <Undo2 className="w-4 h-4" /> : <Trash className="w-4 h-4" />,
        title: isDeleteRevert ? 'Revert' : 'Delete',
        hidden: !hasDelete,
        onClick: () => handleDelete(editableObject.id),
      },
    ];

    return showContextMenu(content);
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
