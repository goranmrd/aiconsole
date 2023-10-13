import { StateCreator } from 'zustand';
import { Api } from '../api/Api';
import { AICStore } from './AICStore';
import { notifications } from '@mantine/notifications';


export type ProjectSlice = {
  projectPath: string;
  projectName: string;
  chooseProject: () => Promise<void>;
  initCurrentProject: () => Promise<void>;
};

export const createProjectSlice: StateCreator<AICStore, [], [], ProjectSlice> = (
  set,
  get,
) => ({
  projectPath: '',
  projectName: '',
  initCurrentProject: async () => {
    const project = (await (await Api.getCurrentProject()).json()) as {name: string, path: string};

    set(() => ({
      projectPath: project.path,
      projectName: project.name,
    }));

    await get().initChatHistory();
    await get().initAgents();
  },
  chooseProject: async () => {
    const project = await Api.chooseProject().json() as {name: string, path: string};

    set(() => ({
      projectPath: project.path,
      projectName: project.name,
    }));

    await get().initCurrentProject();
  },
});