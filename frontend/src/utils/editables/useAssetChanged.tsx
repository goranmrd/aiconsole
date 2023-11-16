import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useEffect, useState } from 'react';

export function useAssetChanged() {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setIsChanged(() => {
      if (!asset) {
        return false;
      }

      if (!lastSavedAsset) {
        return true;
      }

      const changedFields = Object.keys(asset).filter((key) => {
        return (
          key !== 'override' &&
          key !== 'usage_examples' &&
          asset[key as keyof typeof asset] !== lastSavedAsset[key as keyof typeof lastSavedAsset]
        );
      });

      //TODO: deep compare usage_examples

      return changedFields.length > 0;
    });
  }, [asset, lastSavedAsset]);

  return isChanged;
}
