import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { Asset, EditableObject } from '@/types/editables/assetTypes';
import { Chat } from '@/types/editables/chatTypes';
import { getEditableObjectType } from './getEditableObjectType';
import { useCallback } from 'react';

export function useSelectedEditableObject(): [EditableObject | undefined, (editable: EditableObject) => void] {
  const chat = useChatStore((state) => state.chat);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  const type = getEditableObjectType(selectedAsset);

  const setSelectedEditableObject = useCallback(
    (editable: EditableObject) => {
      if (type === 'chat') {
        useChatStore.setState({ chat: editable as Chat });
      } else {
        useAssetStore.setState({ selectedAsset: editable as Asset });
      }
    },
    [type],
  );

  return [chat || selectedAsset, setSelectedEditableObject];
}
