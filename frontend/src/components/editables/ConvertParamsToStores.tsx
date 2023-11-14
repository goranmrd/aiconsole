import { Asset, EditableObject, EditableObjectTypePlural } from '@/types/editables/assetTypes';
import { Chat } from "@/types/editables/chatTypes";
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { SetStateAction, useCallback, useEffect, useMemo } from 'react';
import { convertNameToId } from '@/utils/editables/convertNameToId';
import { v4 as uuid } from 'uuid';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';
import { useWebSocketStore } from '@/api/ws/useWebSocketStore';

function isFunction<T>(value: SetStateAction<T>): value is ((prevState: T) => T) {
  return typeof value === 'function';
}

export function ConvertParamsToStores() {
  // Monitors params and initialises useChatStore.chat and useAssetStore.selectedAsset zustand stores
  const params = useParams();
  const id = params.id || '';
  const editableObjectType = useMemo(() => getEditableObjectType(params.type as EditableObjectTypePlural) || 'chat', [params]);
  const searchParams = useSearchParams()[0];
  const copyId = searchParams.get('copy');

  const setObject = useCallback((objectOrFn: EditableObject | undefined | ((prevState: EditableObject | undefined) => EditableObject | undefined)) => {
    if (editableObjectType === 'chat') {
      useChatStore.setState((prevState) => {
        const chat = isFunction(objectOrFn!) ? (objectOrFn(prevState.chat) as Chat) : objectOrFn as Chat

        useWebSocketStore.getState().sendMessage({
          type: 'SetChatIdWSMessage',
          chat_id: chat.id,
        });

        return { chat };
      });
    } else {
      useAssetStore.setState((prevState) => {
        return { selectedAsset: isFunction(objectOrFn!) ? (objectOrFn(prevState.selectedAsset) as Asset) : objectOrFn as Asset };
      });
    }
  }, [editableObjectType]);

  const setLastSavedObject = useCallback((objectOrFn: EditableObject | undefined | ((prevState: EditableObject | undefined) => EditableObject | undefined)) => {
    if (editableObjectType !== 'chat') {
      useAssetStore.setState((prevState) => {
        return { lastSavedSelectedAsset: isFunction(objectOrFn!) ? (objectOrFn(prevState.lastSavedSelectedAsset) as Asset) : objectOrFn as Asset };
      });
    }
  }, [editableObjectType]);

  // Acquire the initial object
  useEffect(() => {
    if (copyId) {
      setLastSavedObject(undefined);

      if (editableObjectType === 'chat') {
        EditablesAPI.fetchEditableObject<Chat>('chat', id).then((chat) => {
          chat.id = uuid();
          chat.name = chat.name + " (copy)";
          setObject(chat);
        });
      } else {
        EditablesAPI.fetchEditableObject<Asset>(editableObjectType, copyId).then((assetToCopy) => {
          assetToCopy.name += ' Copy';
          assetToCopy.defined_in = 'project';
          assetToCopy.id = convertNameToId(assetToCopy.name);
          setObject(assetToCopy);
        });
      }
    } else {
      //For id === 'new' This will get a default new asset
      EditablesAPI.fetchEditableObject<EditableObject>(editableObjectType, id).then((asset) => {
        setLastSavedObject(id !== 'new' ? asset : undefined); // for new assets, lastSavedAsset is undefined
        setObject(asset);
      });
    }

    return () => {
      //clear all the stores
      useChatStore.setState({ chat: undefined });
      useAssetStore.setState({ selectedAsset: undefined, lastSavedSelectedAsset: undefined });
    };
  }, [copyId, id, editableObjectType, setLastSavedObject, setObject]);

  const chatCandidate = useChatStore((state) => state.chat);
  const assetCandidate = useAssetStore((state) => state.selectedAsset);
  const editable = editableObjectType === 'chat' ? chatCandidate : assetCandidate;

  useEffect(() => {
    // Auto generate id when name changes for assets
    if (editable?.name && editableObjectType !== 'chat') {
      setObject((object) => {
        if (!object) return object;
        const id = convertNameToId(object.name);
        return { ...object, id };
      });
    }
  }, [editable?.name, editableObjectType, setObject]);

  if (editable === undefined) {
    return <div/>;
  } else {
    return <Outlet />;
  }
}
