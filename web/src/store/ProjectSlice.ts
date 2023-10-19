import { StateCreator } from 'zustand';

import { Api } from '@/api/Api';
import { AICStore } from './AICStore';

export type ProjectSlice = {
  projectPath: string;
  projectName: string;
  chooseProject: () => Promise<void>;
  setProject: ({ path, name }: { path: string; name: string }) => Promise<void>;
};

export const createProjectSlice: StateCreator<
  AICStore,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projectPath: '',
  projectName: '',
  setProject: async ({ path, name }: { path: string; name: string }) => {
    set(() => ({
      projectPath: path,
      projectName: name,
    }));

    await get().initChatHistory();
    await get().initAgents();

    //reset url to /
    window.history.pushState({}, '', '/');
  },
  chooseProject: async () => {
    (await Api.chooseProject().json()) as { name: string; path: string };
  },
});
