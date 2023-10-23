import { StateCreator } from 'zustand';

import { Api } from '@/api/Api';
import { AICStore } from './AICStore';

export type ProjectSlice = {
  projectPath: string;
  projectName: string;
  alwaysExecuteCode: boolean;
  chooseProject: () => Promise<void>;
  getSettings: () => void;
  setProject: ({ path, name }: { path: string; name: string }) => Promise<void>;
  enableAutoCodeExecution: () => void;
};

export const createProjectSlice: StateCreator<
  AICStore,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projectPath: '',
  projectName: '',
  alwaysExecuteCode: false,
  enableAutoCodeExecution: async () => {
    await Api.saveSettings({ code_autorun: 1 });
    set({ alwaysExecuteCode: true });
  },
  setProject: async ({ path, name }: { path: string; name: string }) => {
    set(() => ({
      projectPath: path,
      projectName: name,
      alwaysExecuteCode: false,
    }));

    await get().initChatHistory();
    await get().initAgents();
  },
  chooseProject: async () => {
    (await Api.chooseProject().json()) as { name: string; path: string };
    await get().getSettings();
  },
  getSettings: async () => {
    const result = await Api.getSettings();
    set({
      alwaysExecuteCode: !!result.code_autorun,
    });
  },
});
