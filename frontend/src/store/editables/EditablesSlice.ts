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

import { StateCreator } from 'zustand';

import { Asset, EditableObject, EditableObjectType, EditableObjectTypePlural } from '@/types/editables/assetTypes';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { EditablesStore } from './useEditablesStore';
import { getEditableObjectType } from '@/utils/editables/getEditableObjectType';
import { isAsset } from '@/utils/editables/isAsset';

export type EditablesSlice = {
  deleteEditableObject: (editableObjectType: EditableObjectType, id: string) => Promise<void>;
  canOpenFinderForEditable(editable: EditableObject): boolean;
  openFinderForEditable: (editable: EditableObject) => void;
};

export const createEditablesSlice: StateCreator<EditablesStore, [], [], EditablesSlice> = (set) => ({
  deleteEditableObject: async (editableObjectType: EditableObjectType, id: string) => {
    await EditablesAPI.deleteEditableObject(editableObjectType, id);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).filter(
        (editableObject) => editableObject.id !== id,
      ),
    }));
  },
  canOpenFinderForEditable: (editable: EditableObject) => {
    const editableObjectType = getEditableObjectType(editable);

    const isActuallyAnAsset = isAsset(editableObjectType);

    if (isActuallyAnAsset) {
      const asset = editable as Asset;
      if (asset.defined_in === 'aiconsole') {
        return false;
      }
    }

    if (window?.electron?.openFinder === undefined) {
      return false;
    }

    return true;
  },
  openFinderForEditable: async (editable: EditableObject) => {
    const type = getEditableObjectType(editable);
    if (type === undefined) {
      return;
    }

    const path = await EditablesAPI.getPathForEditableObject(type, editable.id);
    window?.electron?.openFinder?.(path || '');
  },
});
