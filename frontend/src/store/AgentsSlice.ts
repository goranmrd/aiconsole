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

import { Agent, Asset, AssetStatus, AssetType, Chat, EditableObject, EditableObjectType, Material } from '../types/types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';
import { convertNameToId } from '@/utils/convertNameToId';
import { v4 as uuid } from 'uuid';

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  getAsset: (assetType: AssetType, id: string) => Asset | undefined;
  renameEditableObject: (editableObjectType: EditableObjectType, originalId: string, newName: string) => Promise<void>;
  deleteEditableObject: (editableObjectType: EditableObjectType, id: string) => Promise<void>;
  setAssetStatus: (assetType: AssetType, id: string, status: AssetStatus) => Promise<void>;
  getEditableObject: (editableObjectType: EditableObjectType, id: string) => EditableObject | undefined;
};

export const createAgentsSlice: StateCreator<AICStore, [], [], AgentsSlice> = (
  set,
  get,
) => ({
  agents: [],
  renameEditableObject: async (editableObjectType: EditableObjectType, originalId: string, newName: string) => {
    const editableObject = get().getEditableObject(editableObjectType, originalId);
    
    if (!editableObject) {
      throw new Error(`Asset ${originalId} not found`);
    }

    const newId = convertNameToId(newName);
    editableObject.id = newId;
    editableObject.name = newName;
    
    await Api.updateEditableObject(editableObjectType, editableObject, originalId);
  },
  deleteEditableObject: async (editableObjectType: EditableObjectType, id: string) => {
    if (editableObjectType === 'chat') {
      await Api.deleteChat(id);

      set(() => ({
        chatHeadlines: get().chatHeadlines.filter((chat) => chat.id !== id),
      }));
    } else {
      await Api.deleteAsset(editableObjectType, id);

      if (editableObjectType === 'agent') {
        set((state) => ({
          agents: (state.agents || []).filter((asset) => asset.id !== id),
        }));
      } else if (editableObjectType === 'material') {
        set((state) => ({
          materials: (state.materials || []).filter((asset) => asset.id !== id),
        }));
      }
    }
  },
  initAgents: async () => {
    if (get().isProjectOpen) {
      const agents = await Api.getAssets<Agent>('agent');
      set(() => ({
        agents: agents,
      }));
    } else {
      set({ agents: [] });
    }
    if (!get().isProjectOpen) return;
  },
  getAsset: (assetType: AssetType, id: string): Asset | undefined => {
    if (assetType === 'agent') {
      if (id === 'user') {
        const agent:Agent = {
          id: 'user',
          name: 'User',
          usage: '',
          usage_examples: [],
          system: '',
          defined_in: 'aiconsole',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        }

        return agent;
      }

      if (id === 'new') {
        const agent:Agent = {
          id: 'new_agent',
          name: 'New agent',
          usage: '',
          usage_examples: [],
          system: '',
          defined_in: 'project',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        }

        return agent;
      }
  
      return get().agents.find((agent) => agent.id === id);
    }

    if (assetType === 'material') {
      if (id === 'new') {
        const material:Material = {
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

        }

        return material;
      }

      return get().materials?.find((material) => material.id === id);
    }

    throw new Error(`Unknown asset type ${assetType}`);
  },
  setAssetStatus: async (assetType: AssetType, id: string, status: AssetStatus) => {
    if (assetType === 'agent') {
      set((state) => ({
        agents: (state.agents || []).map((agent) => {
          if (agent.id === id) {
            agent.status = status;
          }
          return agent;
        }),
      }));
    } else if (assetType === 'material') {
      set((state) => ({
        materials: (state.materials || []).map((material) => {
          if (material.id === id) {
            material.status = status;
          }
          return material;
        }),
      }));
    } else {
      throw new Error(`Unknown asset type ${assetType}`);
    }

    await Api.setAssetStatus(assetType, id, status);
  },
  getEditableObject: (editableObjectType: EditableObjectType, id: string): EditableObject | undefined => {
    if (editableObjectType === 'chat') {
      if (get().chat.id === id) return get().chat;
      
      const newChat: Chat = {
        id: id,
        name: '',
        title_edited: false,
        last_modified: '',
        message_groups: [],
      }

      return newChat;
    }

    if (editableObjectType === 'agent') {
      return get().getAsset('agent', id); 
    }

    if (editableObjectType === 'material') {
      return get().getAsset('material', id);
    }

    throw new Error(`Unknown editable object type ${editableObjectType}`);
  }
});
