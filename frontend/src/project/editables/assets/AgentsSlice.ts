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


import { convertNameToId } from '@/project/editables/assets/convertNameToId';
import { getEditableObjectType } from '@/project/editables/getEditableObjectType';
import { EditablesAPI } from '../EditablesAPI';
import {
  Agent,
  Asset,
  AssetStatus,
  AssetType,
  EditableObject,
  EditableObjectType,
  EditableObjectTypePlural,
  Material,
} from './assetTypes';
import { EditablesStore } from '../useEditablesStore';
import { useProjectsStore } from '@/projects/useProjectsStore';

//TODO: Rename this to EditableObjectsSlice or extract that functionality to a separate slice

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  getAsset: (assetType: AssetType, id: string) => Asset | undefined;
  renameEditableObject: (editableObject: EditableObject, newName: string, isNew: boolean) => Promise<string>;
  deleteEditableObject: (editableObjectType: EditableObjectType, id: string) => Promise<void>;
  setAssetStatus: (assetType: AssetType, id: string, status: AssetStatus) => Promise<void>;
};

export const createAgentsSlice: StateCreator<EditablesStore, [], [], AgentsSlice> = (set, get) => ({
  agents: [],
  //returns new id
  renameEditableObject: async (editableObject: EditableObject, newName: string, isNew: boolean) => {
    editableObject.name = newName;

    const originalId = editableObject.id;
    const editableObjectType = getEditableObjectType(editableObject);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    if (!editableObjectType) throw new Error(`Unknown editable object type ${editableObjectType}`);

    // Chats have persistent ids, no need to update them
    if (editableObjectType !== 'chat') {
      const newId = convertNameToId(newName);
      editableObject.id = newId;
    }

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).map((editableObject) =>
        editableObject.id === originalId ? editableObject : editableObject,
      ),
    }));

    if (!isNew) {
      await EditablesAPI.updateEditableObject(editableObjectType, editableObject, originalId);
    }

    return editableObject.id;
  },
  deleteEditableObject: async (editableObjectType: EditableObjectType, id: string) => {
    await EditablesAPI.deleteEditableObject(editableObjectType, id);
    const editableObjectTypePlural = (editableObjectType + 's') as EditableObjectTypePlural;

    set((state) => ({
      [editableObjectTypePlural]: (state[editableObjectTypePlural] || []).filter(
        (editableObject) => editableObject.id !== id,
      ),
    }));
  },
  initAgents: async () => {
    if (useProjectsStore.getState().isProjectOpen) {
      const agents = await EditablesAPI.fetchEditableObjects<Agent>('agent');

      set({
        agents,
      });
    } else {
      set({ agents: [] });
    }
    if (!useProjectsStore.getState().isProjectOpen) return;
  },
  getAsset: (assetType: AssetType, id: string): Asset | undefined => {
    if (assetType === 'agent') {
      if (id === 'user') {
        const agent: Agent = {
          id: 'user',
          name: 'User',
          usage: '',
          usage_examples: [],
          system: '',
          defined_in: 'aiconsole',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        };

        return agent;
      }

      if (id === 'new') {
        const agent: Agent = {
          id: 'new_agent',
          name: 'New agent',
          usage: '',
          usage_examples: [],
          system: '',
          defined_in: 'project',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        };

        return agent;
      }

      return get().agents.find((agent) => agent.id === id);
    }

    if (assetType === 'material') {
      if (id === 'new') {
        const material: Material = {
          id: 'new_material',
          name: 'New material',
          usage: '',
          usage_examples: [],
          defined_in: 'project',
          status: 'enabled',
          content_api: '',
          content_type: 'static_text',
          content_dynamic_text: '',
          content_static_text: '',
        };

        return material;
      }

      return get().materials?.find((material) => material.id === id);
    }

    throw new Error(`Unknown asset type ${assetType}`);
  },
  setAssetStatus: async (assetType: AssetType, id: string, status: AssetStatus) => {
    const plural = (assetType + 's') as 'materials' | 'agents';
    set((state) => ({
      [plural]: (state[plural] || []).map((asset) => {
        if (asset.id === id) {
          asset.status = status;
        }
        return asset;
      }),
    }));

    await EditablesAPI.setAssetStatus(assetType, id, status);
  },
});
