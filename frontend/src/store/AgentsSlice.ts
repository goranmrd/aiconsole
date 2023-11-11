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

import { Agent, AssetType } from '../types/types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  getAgent: (id: string) => Agent | undefined;
  renameAsset: (assetType: AssetType, id: string, name: string) => Promise<void>;
  deleteAsset: (assetType: AssetType, id: string) => Promise<void>;
};

export const createAgentsSlice: StateCreator<AICStore, [], [], AgentsSlice> = (
  set,
  get,
) => ({
  agents: [],
  renameAsset: async (assetType: AssetType, id: string, name: string) => {
    await Api.renameAsset(assetType, id, name);
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
    set({ agents: [] });
    if (!get().isProjectOpen) return;
    const agents = await Api.getAssets<Agent>('agent');
    set(() => ({
      agents: agents,
    }));
  },
  getAgent: (id: string): Agent | undefined => {
    if (id === 'user') {
      return {
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
    }

    return get().agents.find((agent) => agent.id === id);
  },
});
