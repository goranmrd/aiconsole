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
import { useProjectStore } from '@/store/projects/useProjectStore';
import { Agent } from '@/types/editables/assetTypes';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { EditablesStore } from './useEditablesStore';

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  updateAgentsItem: (updatedAgent: Agent) => void;
};

export const createAgentsSlice: StateCreator<EditablesStore, [], [], AgentsSlice> = (set) => ({
  agents: [],
  initAgents: async () => {
    if (useProjectStore.getState().isProjectOpen) {
      const agents = await EditablesAPI.fetchEditableObjects<Agent>('agent');

      set({
        agents,
      });
    } else {
      set({ agents: [] });
    }
    if (!useProjectStore.getState().isProjectOpen) return;
  },
  updateAgentsItem: (updatedAgent: Agent) => {
    set(({ agents }) => {
      const updatedAgents = agents?.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent));

      return { agents: updatedAgents };
    });
  },
});
