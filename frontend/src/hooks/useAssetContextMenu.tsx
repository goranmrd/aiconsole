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

import { useAICStore } from '@/store/AICStore';
import { Asset, AssetType } from '@/types/types';
import { Ban, Check, Copy, Dot, Edit, File, Trash } from 'lucide-react';
import { ContextMenuItemOptions } from 'mantine-contextmenu';
import { useNavigate } from 'react-router-dom';
import { CONTEXT_MENU_ITEM_CLASSES, useContextMenu } from './useContextMenu';

export function useAssetContextMenu({ assetType, asset, setIsEditing, fromAssetDetail }: { assetType: AssetType; asset?: Asset; setIsEditing?: (isEditing: boolean) => void; fromAssetDetail?: boolean; }) {
  const { showContextMenu, hideContextMenu, isContextMenuVisible } = useContextMenu();

  const deleteAsset = useAICStore((state) => state.deleteAsset);
  const navigate = useNavigate();

  function handleDelete(id: string) {
    if (!window.confirm(`Are you sure you want to delete this ${assetType}?`)) {
      return;
    }

    deleteAsset(assetType, id);
  }

  function showContextMenuReplacement(content: ContextMenuItemOptions[] = []): React.MouseEventHandler<Element> {
    return showContextMenu([
        ...content,
        ...(asset && !fromAssetDetail ? [{
          key: 'Open',
          icon: <File className="w-4 h-4" />,
          title: 'Open',
          onClick: () => {
            navigate(`/${assetType}s/${asset.id}`);
          },
        }] : []),
        ...(asset ? [{
          key: 'Edit as New',
          icon: <Copy className="w-4 h-4" />,
          title: 'Edit as New',
          onClick: () => {
            navigate(`/${assetType}s/new?copy=${asset.id}`);
          },
        }] : []),
        ...(asset?.defined_in === 'project' && setIsEditing ? [{
          key: 'Rename',
          icon: <Edit className="w-4 h-4" />,
          title: 'Rename',
          onClick: () => {
            setIsEditing(true);
          },
        }] : []),
        { key: 'divider' },
        
        {
          key: 'usage',
          icon: {
            'enabled': <Dot className="w-4 h-4" />,
            'disabled': <Ban className="w-4 h-4" />,
            'forced': <Check className="w-4 h-4" />,
          }[asset?.status || 'enabled'],
          title: 'Usage',
          
          items: [
            ...(asset && asset?.status !== 'forced' ? [{
              key: 'Always',
              icon: <Check className="w-4 h-4" />,
              title: 'Always',
              className: CONTEXT_MENU_ITEM_CLASSES,
              onClick: () => {
                useAICStore.getState().setAssetStatus(assetType, asset.id, 'forced');
              },
            }] : []),
            ...(asset && asset?.status !== 'enabled' ? [{
              key: 'Auto',
              icon: <Dot className="w-4 h-4" />,
              title: 'Auto',
              className: CONTEXT_MENU_ITEM_CLASSES,
              onClick: () => {
                useAICStore.getState().setAssetStatus(assetType, asset.id, 'enabled');
              },
            }] : []),
            ...(asset && asset?.status !== 'disabled' ? [{
              key: 'Never',
              icon: <Ban className="w-4 h-4" />,
              title: 'Never',
              className: CONTEXT_MENU_ITEM_CLASSES,
              onClick: () => {
                useAICStore.getState().setAssetStatus(assetType, asset.id, 'disabled');
              },
            }] : []),
          ],
        },
        { key: 'divider2' },
        ...(asset?.defined_in === 'project' ? [{
          key: 'Delete',
          icon: <Trash className="w-4 h-4" />,
          title: 'Delete',
          color: 'red',
          onClick: () => handleDelete(asset.id),
        }] : []),
      ]);
  }

  return { showContextMenu: showContextMenuReplacement, hideContextMenu, isContextMenuVisible };
}
