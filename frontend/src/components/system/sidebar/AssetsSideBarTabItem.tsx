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

import { useAssetContextMenu } from '@/hooks/useAssetContextMenu';
import { useAICStore } from '@/store/AICStore';
import { Asset, AssetType } from '@/types/types';
import { getAssetIcon } from '@/utils/getAssetIcon';
import { cn } from '@/utils/styles';
import { useMemo, useState } from 'react';
import { getAssetStatusIcon } from '../../../utils/getAssetStatusIcon';
import SideBarItem from './SideBarItem';
import { getAssetColor } from '@/utils/getAssetColor';

export function AssetsSideBarTabItem({ assetType, asset }: { asset: Asset, assetType: AssetType }) {
  const renameAsset = useAICStore((state) => state.renameAsset);

  const [isEditing, setIsEditing] = useState(false);
  const { showContextMenu } = useAssetContextMenu({ assetType, asset, setIsEditing });


  const rename = (value: string, assetId: string) => {
    renameAsset(assetType, assetId, value);
  };

  const StatusIcon = useMemo(() => getAssetStatusIcon(asset.status), [asset.status]);
  const Icon = getAssetIcon(asset);
  const color = getAssetColor(asset);
  

  return (
    <SideBarItem
      icon={Icon}
      color={color}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      label={asset.name}
      linkTo={`/${assetType}s/${asset.id}`}
      onRename={(value) => rename(value, asset.id)}
      key={asset.id}
      onContextMenu={showContextMenu()}
    >
      <StatusIcon
        className={cn('w-[15px] h-[15px]  text-gray-300 ', {
          'text-gray-500': asset.status === 'disabled',
        })}
      />
    </SideBarItem>
  );
}
