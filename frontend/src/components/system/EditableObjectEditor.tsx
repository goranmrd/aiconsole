import { AssetEditor } from '@/components/assets/AssetEditor';
import { useEditableObjectContextMenu } from '@/hooks/useEditableObjectContextMenu';
import { useAICStore } from '@/store/AICStore';
import { EditableObjectTypePlural } from '@/types/types';
import { getEditableObjectColor } from '@/utils/getEditableObjectColor';
import { getEditableObjectIcon } from '@/utils/getEditableObjectIcon';
import { getEditableObjectType } from '@/utils/getEditableObjectType';
import { useParams } from 'react-router-dom';
import { ChatPage } from '../chat/ChatPage';

export function EditableObjectEditor() {
  /*
 
 
  const Icon = getAssetIcon(asset || assetType);
 
  const { showContextMenu } = useAssetContextMenu({ assetType, asset: asset, fromAssetDetail: true });
 
  <div className="flex gap-5" onContextMenu={showContextMenu()}>
        <Tooltip
          label={`${typeName} id determines the file name and is auto generated from name. It must be unique.`}
          position="top-end"
          offset={{ mainAxis: 7 }}
        >
          <div className="flex flex-row items-center gap-2 font-bold">
            <Icon style={{ color: getAssetColor(asset || assetType) }} /> {asset?.id}
          </div>
        </Tooltip>
 
        {readOnly && (
          <div className="flex gap-2 items-center text-md font-bold ml-auto ">
            <Eye className="w-4 h-4" />
            This is a system {assetType}. It can't be edited.
          </div>
        )}
      </div>
 
      */
  const id = useParams().id || '';
  const editableObjectType = getEditableObjectType(useParams().type as EditableObjectTypePlural) || 'chat';
  const editableObject = useAICStore((state) => state.getEditableObject(editableObjectType, id));

  const { showContextMenu } = useEditableObjectContextMenu({ editableObjectType, editableObject });

  const Icon = getEditableObjectIcon(editableObject);
  const color = getEditableObjectColor(editableObject);

  if (!editableObject) {
    return <div className="flex flex-col w-full h-full items-center justify-center">Not found</div>;
  }

  const name = editableObject.name || 'New ' + editableObjectType;

  return (
    <div className="flex flex-col w-full h-full max-h-full overflow-auto">
      <div
        onContextMenu={showContextMenu()}
        onClick={showContextMenu()}
        className="flex-none flex flex-row gap-2 cursor-pointer p-4 border-b border-gray-600 bg-gray-700/20 shadow-md"
      >
        <Icon style={{ color }} /> {name}
      </div>
      <div className="flex-grow overflow-auto">
        {editableObjectType === 'chat' && <ChatPage />}
        {editableObjectType === 'agent' && <AssetEditor assetType="agent" />}
        {editableObjectType === 'material' && <AssetEditor assetType="material" />}
      </div>
    </div>
  );
}
