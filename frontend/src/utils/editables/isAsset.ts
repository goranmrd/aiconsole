import { EditableObject, EditableObjectType } from '@/types/editables/assetTypes';
import { getEditableObjectType } from './getEditableObjectType';

export function isAsset(editableObject?: EditableObject | EditableObjectType) {
  if (!editableObject) {
    return false;
  }

  const editableObjectType =
    typeof editableObject === 'string' ? editableObject : getEditableObjectType(editableObject);
  return editableObjectType === 'material' || editableObjectType === 'agent';
}
