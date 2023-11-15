import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';

export function useSelectedEditableObject() {
  const chat = useChatStore((state) => state.chat);
  const selectedAsset = useAssetStore((state) => state.selectedAsset);
  return chat || selectedAsset;
}
