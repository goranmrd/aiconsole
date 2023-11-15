import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useEffect, useState } from 'react';

export function useAssetChanged() {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setIsChanged(() => {
      if (!asset || !lastSavedAsset) {
        return true;
      }

      const changedFields = Object.keys(asset).filter((key) => {
        return (
          key !== 'status' && asset[key as keyof typeof asset] !== lastSavedAsset[key as keyof typeof lastSavedAsset]
        );
      });

      return changedFields.length > 0;
    });
  }, [asset, lastSavedAsset]);

  return isChanged;
}
