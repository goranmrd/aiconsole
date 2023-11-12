import { AssetEditor } from '@/components/assets/AssetEditor';
import { useEditableObjectContextMenu } from '@/hooks/useEditableObjectContextMenu';
import { Asset, Chat, EditableObject, EditableObjectTypePlural } from '@/types/types';
import { getEditableObjectColor } from '@/utils/getEditableObjectColor';
import { getEditableObjectIcon } from '@/utils/getEditableObjectIcon';
import { getEditableObjectType } from '@/utils/getEditableObjectType';
import { useParams, useSearchParams } from 'react-router-dom';
import { ChatPage } from '../chat/ChatPage';
import { useEffect, useState } from 'react';
import InlineEditableObjectName from './InlineEditableObjectName';
import { Api } from '@/api/Api';
import { convertNameToId } from '@/utils/convertNameToId';
import { v4 as uuid } from 'uuid';


/*
setChatId: async (id: string) => {
  set({
    chatId: id,
    loadingMessages: true
  });

  try {
    useWebSocketStore.getState().sendMessage({
      type: 'SetChatIdWSMessage',
      chat_id: id,
    });

    let chat: Chat;
    
    if (id === '' || !get().isProjectOpen) {
      chat = {
        id: '',
        name: '',
        last_modified: new Date().toISOString(),
        title_edited: false,
        message_groups: [],
      };
    } else {
      chat = await Api.fetchEditableObject('chat', id);
    }
    set({
      chat: chat,
    });
  } finally {
    set({
      loadingMessages: false,
    });
  }
},*/

export function EditableObjectEditor() {
  /*
    <Tooltip`${typeName} id determines the file name and is auto generated from name. It must be unique.`
  */
  const id = useParams().id || '';
  const [isEditing, setIsEditing] = useState(false);
  const [object, setObject] = useState<EditableObject | undefined>(undefined);
  const [lastSavedObject, setLastSavedObject] = useState<EditableObject | undefined>(undefined);
  const editableObjectType = getEditableObjectType(useParams().type as EditableObjectTypePlural) || 'chat';
  const searchParams = useSearchParams()[0];
  const copyId = searchParams.get('copy');

  // Acquire the initial object
  useEffect(() => {
    if (copyId) {
      setLastSavedObject(undefined);
          
      if (editableObjectType === 'chat') {
        Api.fetchEditableObject<Chat>('chat', id).then((chat) => {
          chat.id = uuid();
          chat.name = chat.name + " (copy)"
          setObject(chat);
        });
      } else {
        Api.fetchEditableObject<Asset>(editableObjectType, copyId).then((assetToCopy) => {
          assetToCopy.name += ' Copy';
          assetToCopy.defined_in = 'project';
          assetToCopy.id = convertNameToId(assetToCopy.name);
          setObject(assetToCopy);
        });
      }
    } else if (id) {
      Api.fetchEditableObject<EditableObject>(editableObjectType, id).then((asset) => {
        setLastSavedObject(asset);
        setObject(asset);
      });
    } else {
      //HACK: This will get a default new asset
      Api.fetchEditableObject<EditableObject>(editableObjectType, 'new').then((asset) => {
        setLastSavedObject(undefined);
        setObject(asset);
      });
    }
  }, [copyId, id, editableObjectType]);

  useEffect(() => {
    // Auto generate id based on name
    if (object?.name && editableObjectType !== 'chat') {
      setObject((object) => {
        if (!object) return object;
        const id = convertNameToId(object.name);
        return { ...object, id };
      });
    }
  }, [object?.name, editableObjectType]);

  const { showContextMenu } = useEditableObjectContextMenu({ editableObjectType, editableObject: object, setIsEditing });

  const Icon = getEditableObjectIcon(object);
  const color = getEditableObjectColor(object);

  if (!object) {
    return <div className="flex flex-col w-full h-full items-center justify-center">Not found</div>;
  }

  let extraStuff = null;
  if (editableObjectType !== 'chat') {
    const asset: Asset = object as Asset;
    extraStuff = `(in ${asset.defined_in})`;
  }

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-auto">
      <div
        onContextMenu={showContextMenu()}
        onClick={() => setIsEditing(true)}
        className="w-fullflex-none flex flex-row gap-2 cursor-pointer p-4 border-b border-gray-600 bg-gray-700/20 shadow-md items-center"
      >
        <Icon style={{ color }} />{' '}
        <InlineEditableObjectName
          editableObject={object}
          editableObjectType={editableObjectType}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          className="flex-grow"
          isNew={id === 'new'}
        />
        <div className="self-end">{extraStuff}</div>
      </div>
      <div className="flex-grow overflow-auto">
        {editableObjectType === 'chat' && <ChatPage />}
        {editableObjectType === 'agent' && <AssetEditor asset={object as Asset} lastSavedAsset={lastSavedObject as Asset} setAsset={setObject} setLastSavedAsset={setLastSavedObject} />}
        {editableObjectType === 'material' && <AssetEditor asset={object as Asset} lastSavedAsset={lastSavedObject as Asset} setAsset={setObject} setLastSavedAsset={setLastSavedObject} />}
      </div>
    </div>
  );
}
