import { Asset } from '@/types/types';


export function getAssetType(asset: Asset) {
  // A bit hacky but effective way to distinguish between agent and material assets
  
  if ('system' in asset) {
    return 'agent';
  }

  if ('content_type' in asset) {
    return 'material';
  }

  throw new Error(`Unknown asset type: ${asset}`);
}
