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
    await Api.saveSettings({ code_autorun: true });
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
      alwaysExecuteCode: result.code_autorun,
    });
  },
});
