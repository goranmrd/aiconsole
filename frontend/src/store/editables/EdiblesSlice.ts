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

import { EditableObjectType, EditableObjectTypePlural } from '@/types/editables/assetTypes';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { EditablesStore } from './useEditablesStore';

export type EdiblesSlice = {
  deleteEditableObject: (editableObjectType: EditableObjectType, id: string) => Promise<void>;
};

export const createEdiblesSlice: StateCreator<EditablesStore, [], [], EdiblesSlice> = (set) => ({
  deleteEditableObject: async (editableObjectType: EditableObjectType, id: string) => {
    await EditablesAPI.deleteEditableObject(editableObjectType, id);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).filter(
        (editableObject) => editableObject.id !== id,
      ),
    }));
  },
});
