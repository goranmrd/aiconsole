import { StateCreator } from 'zustand';

import { Agent } from '../types/types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';

export type AgentsSlice = {
  agents: Agent[];
  initAgents: () => Promise<void>;
  getAgent: (id: string) => Agent | undefined;
};

export const createAgentsSlice: StateCreator<AICStore, [], [], AgentsSlice> = (
  set,
  get,
) => ({
  agents: [],
  initAgents: async () => {
    const agents = await Api.getAgents();
    set(() => ({
      agents: agents,
    }));
  },
  getAgent: (id: string) => {
    return get().agents.find((agent) => agent.id === id);
  },
});
