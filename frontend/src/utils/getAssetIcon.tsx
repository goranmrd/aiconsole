import { Asset, AssetType, MaterialContentType } from '@/types/types';
import { getAssetType } from '@/utils/getAssetType';
import { Bot, BugPlay, FileType2, Grid2x2, MessageSquare, StickyNote } from 'lucide-react';

export const CHAT_ICON = MessageSquare;
export const CHAT_COLOR = "#A67CFF"

export function getAssetIcon(asset: Asset | AssetType) {
  let assetType;
  let contentType: MaterialContentType = 'static_text';

  if (typeof asset === 'string') {
    assetType = asset;
  } else {
    assetType = getAssetType(asset);
    if ('content_type' in asset) {
      contentType = asset.content_type as MaterialContentType;
    }
  }

  switch (assetType) {
    case 'material':
      switch (contentType) {
        case 'static_text':
          return StickyNote;
        case 'dynamic_text':
          return FileType2;
        case 'api':
          return BugPlay;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }
      
      return Grid2x2;
    case 'agent':
      return Bot;
    default:
      throw new Error(`Unknown asset type: ${assetType}`);
  }
}


