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
