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

import { Agent, Asset, AssetStatus, AssetType } from '../types/types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';
import { convertNameToId } from '@/utils/convertNameToId';

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  getAsset: (assetType: AssetType, id: string) => Asset | undefined;
  renameAsset: (assetType: AssetType, originalId: string, newName: string) => Promise<void>;
  deleteAsset: (assetType: AssetType, id: string) => Promise<void>;
  setAssetStatus: (assetType: AssetType, id: string, status: AssetStatus) => Promise<void>;
};

export const createAgentsSlice: StateCreator<AICStore, [], [], AgentsSlice> = (
  set,
  get,
) => ({
  agents: [],
  renameAsset: async (assetType: AssetType, originalId: string, newName: string) => {
    const asset = get().getAsset(assetType, originalId);
    
    if (!asset) {
      throw new Error(`Asset ${originalId} not found`);
    }

    const newId = convertNameToId(newName);
    asset.id = newId;
    asset.name = newName;
    
    await Api.updateAsset(assetType, asset, originalId);
  },
  deleteAsset: async (assetType: AssetType, id: string) => {
    await Api.deleteAsset(assetType, id);

    if (assetType === 'agent') {
      set((state) => ({
        agents: (state.agents || []).filter((asset) => asset.id !== id),
      }));
    } else if (assetType === 'material') {
      set((state) => ({
        materials: (state.materials || []).filter((asset) => asset.id !== id),
      }));
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
  
      return get().agents.find((agent) => agent.id === id);
    }

    if (assetType === 'material') {
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
  }
});
