// The AIConsole Project
//
// Copyright 2023 10Clouds
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { AssetEditor } from '@/components/editables/assets/AssetEditor';
import { useEditableObjectContextMenu as useContextMenuForEditable } from '@/utils/editables/useContextMenuForEditable';
import { Asset, EditableObjectTypePlural } from '@/types/editables/assetTypes';
import { getEditableObjectColor } from '@/utils/editables/getEditableObjectColor';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';
import { useParams } from 'react-router-dom';
import { ChatPage } from './chat/ChatPage';
import { useState } from 'react';
import InlineEditableObjectName from './InlineEditableObjectName';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAssetStore } from '@/store/editables/asset/useAssetStore';

export function EditableObjectEditor() {
  
  /*
    <Tooltip`${typeName} id determines the file name and is auto generated from name. It must be unique.`
  */
  
  const [isEditing, setIsEditing] = useState(false);

  const chatCandidate = useChatStore((state) => state.chat);
  const assetCandidate = useAssetStore((state) => state.selectedAsset);
  const editableType = getEditableObjectType(useParams().type as EditableObjectTypePlural) || 'chat';
  const editable = editableType === 'chat' ? chatCandidate : assetCandidate;

  const lastSavedChat = undefined;
  const lastSavedAsset = useAssetStore((state) => state.lastSavedSelectedAsset);
  const lastSavedEditable = editableType === 'chat' ? lastSavedChat : lastSavedAsset; 

  const { showContextMenu } = useContextMenuForEditable({ editableObjectType: editableType, editable, setIsEditing });

  const Icon = getEditableObjectIcon(editable);
  const color = getEditableObjectColor(editable);

  if (!editable) {
    return <div className="flex flex-col w-full h-full items-center justify-center">Not found</div>;
  }

  let extraStuff = null;
  if (editableType !== 'chat') {
    const asset: Asset = editable as Asset;
    extraStuff = `(in ${asset.defined_in})`;
  }

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-auto">
      <div
        onContextMenu={showContextMenu()}
        onClick={() => setIsEditing(true)}
        className="w-full flex-none flex flex-row gap-2 cursor-pointer p-4 border-b border-gray-600 bg-gray-700/20 shadow-md items-center w-full overflow-clip "
      >
        <Icon style={{ color }} className='flex-none' />{' '}
        <InlineEditableObjectName
          editableObject={editable}
          editableObjectType={editableType}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          className="flex-grow truncate"
          isNew={lastSavedEditable === undefined && editableType !== 'chat'}
        />
        <div className="self-end min-w-fit">{extraStuff}</div>
      </div>
      <div className="flex-grow overflow-auto">
        {editableType === 'chat' && <ChatPage />}
        {editableType !== 'chat' && <AssetEditor />}
      </div>
    </div>
  );
}
