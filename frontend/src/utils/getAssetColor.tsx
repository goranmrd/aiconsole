import { Asset, AssetType } from '@/types/types';
import { getAssetType } from '@/utils/getAssetType';


export function getAssetColor(asset: Asset | AssetType) {
  let assetType;

  if (typeof asset === 'string') {
    assetType = asset;
  } else {
    assetType = getAssetType(asset);
  }

  switch (assetType) {
    case 'material':
      return '#CFA740';
    case 'agent':
      return '#62ADF2';
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}
