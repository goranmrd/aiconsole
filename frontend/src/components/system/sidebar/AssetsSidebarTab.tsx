import { Asset, AssetType } from '@/types/types';
import { AssetsSideBarTabItem } from './AssetsSideBarTabItem';

export const AssetsSidebarTab = ({assetType, assets}: {assetType: AssetType, assets: Asset[]}) => {
  return (
      <div className="flex flex-col gap-[5px] pr-[15px]">
        {assets.map((asset) => (
          <AssetsSideBarTabItem
            key={asset.id}
            assetType={assetType}
            asset={asset}
          />
        ))}
      </div>
  );
};
