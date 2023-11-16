import { EditableObject } from '@/types/editables/assetTypes';
import { getEditableObjectColor } from '@/utils/editables/getEditableObjectColor';
import { getEditableObjectIcon } from '@/utils/editables/getEditableObjectIcon';
import { MouseEventHandler, useState } from 'react';
import InlineEditableObjectName from './InlineEditableObjectName';

export function EditorHeader({
  editable,
  onRename,
  children,
  isChanged,
  onContextMenu,
}: {
  editable?: EditableObject;
  onRename: (newName: string) => void;
  children?: React.ReactNode;
  isChanged?: boolean;
  onContextMenu?: () => MouseEventHandler;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const Icon = getEditableObjectIcon(editable);
  const color = getEditableObjectColor(editable);

  if (!editable) {
    return <div className="flex flex-col w-full h-full items-center justify-center">Not found</div>;
  }

  return (
    <div
      onContextMenu={onContextMenu}
      onClick={() => setIsEditing(true)}
      className="w-full flex-none flex flex-row gap-2 cursor-pointer p-4 border-b border-gray-600 bg-gray-700/20 shadow-md items-center overflow-clip "
    >
      <Icon style={{ color }} className="flex-none" />
      <InlineEditableObjectName
        editableObject={editable}
        onRename={onRename}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        className={'flex-grow truncate ' + (isChanged ? ' italic font-bold ' : '')}
      />
      <div className="self-end min-w-fit">{children}</div>
    </div>
  );
}
