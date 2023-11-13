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

import { create } from 'zustand';

import { useEditablesStore } from '@/project/editables/store/useEditablesStore';
import { useChatStore } from '../project/editables/chat/store/useChatStore';
import { useSettingsStore } from '../settings/useSettingsStore';
import { ProjectsAPI } from './ProjectsAPI';

export type ProjectSlice = {
  projectPath?: string; //undefined means loading, '' means no project, otherwise path
  tempPath?: string;
  projectName?: string;
  isProjectDirectory?: boolean | undefined;
  chooseProject: (path?: string) => Promise<void>;
  resetIsProjectFlag: () => void;
  checkPath: (path?: string) => Promise<void>;
  isProjectLoading: boolean;
  isProjectOpen: boolean;
  onProjectOpened: ({ path, name, initial }: { path: string; name: string; initial: boolean }) => Promise<void>;
  onProjectClosed: () => Promise<void>;
  onProjectLoading: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useProjectsStore = create<ProjectSlice>((set, _) => ({
  projectPath: undefined,
  tempPath: undefined,
  isProjectDirectory: undefined,
  projectName: undefined,
  isProjectLoading: true,
  isProjectOpen: false,
  onProjectOpened: async ({ path, name, initial }: { path: string; name: string; initial: boolean }) => {
    if (!path || !name) {
      throw new Error('Project path or name is not defined');
    }

    set(() => ({
      projectPath: path,
      projectName: name,
      isProjectOpen: true,
      isProjectLoading: false,
    }));

    await Promise.all([useChatStore.getState().initCommandHistory(), useEditablesStore.getState().initChatHistory()]);

    if (initial) {
      await Promise.all([
        useEditablesStore.getState().initAgents(),
        useEditablesStore.getState().initMaterials(),
        useSettingsStore.getState().initSettings(),
      ]);
    }
  },
  onProjectClosed: async () => {
    set(() => ({
      projectPath: '',
      projectName: '',
      isProjectOpen: false,
      isProjectLoading: false,
    }));
  },
  onProjectLoading: () => {
    set(() => ({
      projectPath: undefined,
      projectName: undefined,
      isProjectOpen: false,
      isProjectLoading: true,
    }));
  },
  resetIsProjectFlag: () => {
    set({
      isProjectDirectory: undefined,
      tempPath: '',
    });
  },
  chooseProject: async (path?: string) => {
    // If we are in electron environment, use electron dialog, otherwise rely on the backend to open the dialog
    if (!path && window?.electron?.openDirectoryPicker) {
      const path = await window?.electron?.openDirectoryPicker();
      if (path) {
        (await ProjectsAPI.chooseProject(path).json()) as {
          name: string;
          path: string;
        };
      }

      return;
    }
    (await ProjectsAPI.chooseProject(path).json()) as {
      name: string;
      path: string;
    };
  },
  checkPath: async (pathToCheck?: string) => {
    // If we are in electron environment, use electron dialog, otherwise rely on the backend to open the dialog
    let pathFromElectron;

    if (!pathToCheck && window?.electron?.openDirectoryPicker) {
      pathFromElectron = await window?.electron?.openDirectoryPicker();

      if (!pathFromElectron) {
        return;
      }
    }

    const path = pathToCheck || pathFromElectron;
    const { is_project, path: tkPath } = await ProjectsAPI.isProjectDirectory(path);
    set({
      isProjectDirectory: is_project,
      tempPath: tkPath,
    });
    if (is_project === undefined && !tkPath) {
      (await ProjectsAPI.chooseProject(path).json()) as {
        name: string;
        path: string;
      };
    }
  },
}));
