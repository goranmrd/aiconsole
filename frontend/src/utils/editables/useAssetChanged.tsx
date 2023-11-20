import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Asset } from '@/types/editables/assetTypes';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const isAssetUpdated = (asset: Asset, lastSavedAsset: Asset) =>
  Object.keys(asset).some((key) => {
    return (
      key !== 'override' &&
      key !== 'usage_examples' &&
      asset[key as keyof typeof asset] !== lastSavedAsset[key as keyof typeof lastSavedAsset]
    );
  });

export function useAssetChanged() {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const { pathname } = useLocation();
  const isNewAssetPath = pathname.includes('new');
  const ref = useRef<Asset | undefined>(asset);

  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (isNewAssetPath && !ref.current && asset) {
      ref.current = asset;
    }
    if (!asset) {
      ref.current = undefined;
    }
  }, [isNewAssetPath, asset]);

  useEffect(() => {
    setIsChanged(() => {
      if (!asset) {
        return false;
      }

      if (!lastSavedAsset) {
        return ref.current ? isAssetUpdated(asset, ref.current) : true;
      }

      return isAssetUpdated(asset, lastSavedAsset);

      //TODO: deep compare usage_examples
    });
  }, [asset, lastSavedAsset]);

  return isChanged;
}
