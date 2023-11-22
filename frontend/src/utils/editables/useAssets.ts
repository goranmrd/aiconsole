import { EditablesAPI } from '@/api/api/EditablesAPI';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Asset, EditableObjectType } from '@/types/editables/assetTypes';
import { showNotification } from '@mantine/notifications';

export const useAssets = (assetType: EditableObjectType) => {
  const asset = useAssetStore((state) => state.selectedAsset);
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const isAssetStatusChanged = (() => {
    if (!asset || !lastSavedAsset) {
      return false;
    }
    return asset.status !== lastSavedAsset.status;
  })();

  const updateStatusIfNecessary = async () => {
    if (assetType === 'chat') return;
    if (isAssetStatusChanged && asset) {
      await EditablesAPI.setAssetStatus(assetType, asset.id, asset.status);

      showNotification({
        title: 'Status changed',
        message: `Status changed to ${asset.status}`,
        variant: 'success',
      });
    }
  };

  const renameAsset = async (previousAssetId: string, updatedAsset: Asset) => {
    await EditablesAPI.saveNewEditableObject(assetType, previousAssetId, updatedAsset);
    await updateStatusIfNecessary();
  };

  return {
    updateStatusIfNecessary,
    isAssetStatusChanged,
    renameAsset,
  };
};
