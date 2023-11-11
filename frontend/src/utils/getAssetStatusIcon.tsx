import { AssetStatus } from '@/types/types';
import { Ban, Check, Dot } from 'lucide-react';


export function getAssetStatusIcon(status?: AssetStatus) {
  switch (status) {
    case 'forced':
      return Check;
    case 'enabled':
      return Dot;
    default:
    case 'disabled':
      return Ban;
  }
}


