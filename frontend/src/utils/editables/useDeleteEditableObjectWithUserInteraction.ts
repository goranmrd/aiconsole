import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { Asset, EditableObjectType } from '@/types/editables/assetTypes';
import { useNavigate } from 'react-router-dom';
import { useSelectedEditableObject } from './useSelectedEditableObject';
import { isAsset } from './isAsset';
import { v4 as uuidv4 } from 'uuid';

export function useDeleteEditableObjectWithUserInteraction(editableObjectType: EditableObjectType) {
  const navigate = useNavigate();
  const deleteEditableObject = useEditablesStore((state) => state.deleteEditableObject);
  const editable = useSelectedEditableObject();

  function handleDelete(id: string) {
    if (!window.confirm(`Are you sure you want to delete this ${editableObjectType}?`)) {
      return;
    }

    deleteEditableObject(editableObjectType, id);

    if (editable?.id === id) {
      if (isAsset(editableObjectType) && (editable as Asset).override) {
        //Force reload of the current asset
        navigate(`/${editableObjectType}s/${id}?forceRefresh=${uuidv4()}`);
      } else {
        navigate(`/${editableObjectType}s`);
      }
    }
  }

  return handleDelete;
}
