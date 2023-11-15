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

import { Asset, AssetType } from '@/types/editables/assetTypes';
import SideBarItem from './SideBarItem';

interface GroupedMaterial {
  status: string;
  assets: Asset[];
}

export const AssetsSidebarTab = ({ assetType, assets }: { assetType: AssetType; assets: Asset[] }) => {
  function groupAssetsByStatus(): GroupedMaterial[] {
    if (!assets) return [];

    const groupedMaterials: Record<string, Asset[]> = assets.reduce((grouped: Record<string, Asset[]>, asset) => {
      const { status } = asset;
      grouped[status] = grouped[status] || [];
      grouped[status].push(asset);
      return grouped;
    }, {});

    return Object.entries(groupedMaterials).map(([status, assets]) => ({ status, assets }));
  }

  const groupedAssets = groupAssetsByStatus();

  return (
    <div className="flex flex-col gap-[5px] pr-[20px] overflow-y-auto h-full max-h-[calc(100vh-210px)]">
      {groupedAssets.map(
        (assetGroup) =>
          assetGroup.status.length > 0 && (
            <div key={assetGroup.status}>
              <h3 className="uppercase px-[9px] py-[5px] text-gray-400 text-[12px] leading-[18px]">
                {assetGroup.status}
              </h3>
              {assetGroup.assets.map((asset) => (
                <SideBarItem key={asset.id} editableObject={asset} editableObjectType={assetType} />
              ))}
            </div>
          ),
      )}
    </div>
  );
};
