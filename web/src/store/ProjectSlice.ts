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

import { Api } from '@/api/Api';
import { AICStore } from './AICStore';

export type ProjectSlice = {
  projectPath?: string; //undefined means loading, '' means no project, otherwise path
  projectName?: string;
  alwaysExecuteCode: boolean;
  openAiApiKey?: string | null;
  chooseProject:  (path?: string) => Promise<void>;
  initSettings: () => Promise<void>;
  isProjectLoading: () => boolean;
  isProjectOpen: () => boolean;
  setProject: ({ path, name }: { path: string; name: string }) => Promise<void>;
  closeProject: () => Promise<void>;
  markProjectAsLoading: () => void;
  enableAutoCodeExecution: () => void;
  setOpenAiApiKey: (key: string) => Promise<void>;
};

export const createProjectSlice: StateCreator<
  AICStore,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projectPath: undefined,
  projectName: undefined,
  alwaysExecuteCode: false,
  openAiApiKey: undefined,
  enableAutoCodeExecution: async () => {
    await Api.saveSettings({ code_autorun: true, to_global: true});
    set({ alwaysExecuteCode: true });
  },
  setOpenAiApiKey: async (key: string) => {
    await Api.saveSettings({ openai_api_key: key, to_global: true });
    set({ openAiApiKey: key });
  },
  setProject: async ({ path, name }: { path: string; name: string }) => {
    set(() => ({
      projectPath: path,
      projectName: name,
      alwaysExecuteCode: false,
    }));

    await Promise.all([
      get().initCommandHistory(),
      get().initChatHistory(),
      get().initAgents(),
      get().initSettings(),
    ]);
    
  },
  closeProject: async () => {
    set(() => ({
      projectPath: '',
      projectName: '',
      alwaysExecuteCode: false,
    }));
  },
  markProjectAsLoading: () => {
    set(() => ({
      projectPath: undefined,
      projectName: undefined,
    }));
  },
  isProjectLoading: () => {
    return get().projectPath === undefined;
  },
  isProjectOpen: () => {
    return !!get().projectPath;
  },
  chooseProject: async (path?: string) => {
    (await Api.chooseProject(path).json()) as { name: string; path: string };
  },
  initSettings: async () => {
    const result = await Api.getSettings();
    set({
      alwaysExecuteCode: result.code_autorun,
      openAiApiKey: result.openai_api_key
    });
  },
});
