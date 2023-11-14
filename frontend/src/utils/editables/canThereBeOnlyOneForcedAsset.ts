import { Asset, AssetType } from "@/types/editables/assetTypes";


export function canThereBeOnlyOneForcedAsset(asset: Asset | AssetType) {
    let assetType;

    if (typeof asset === 'string') {
      assetType = asset;
    } else {
      assetType = asset.status
    }

    return assetType === 'agent'
}