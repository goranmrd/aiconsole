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

import showNotification from '@/utils/common/showNotification';
import { ProjectsAPI } from '@/api/api/ProjectsAPI';
import { create } from 'zustand';
import { SettingsAPI } from '../../api/api/SettingsAPI';
import { useProjectStore } from '@/store/projects/useProjectStore';

export type SettingsStore = {
  openAiApiKey?: string | null;
  isApiKeyValid?: boolean;
  alwaysExecuteCode: boolean;
  initSettings: () => Promise<void>;
  setAutoCodeExecution: (autoRun: boolean) => void;
  saveOpenAiApiKey: (key: string) => Promise<void>;
  validateApiKey: (key: string) => Promise<boolean>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSettingsStore = create<SettingsStore>((set, get) => ({
  openAiApiKey: undefined,
  isApiKeyValid: false,
  alwaysExecuteCode: false,
  setAutoCodeExecution: async (autoRun: boolean) => {
    await SettingsAPI.saveSettings({ code_autorun: autoRun, to_global: true });
    set({ alwaysExecuteCode: autoRun });
  },
  saveOpenAiApiKey: async (key: string) => {
    await SettingsAPI.saveSettings({
      openai_api_key: key,
      to_global: true,
    });

    set({
      openAiApiKey: key,
      isApiKeyValid: true // We assume that they key was validated before saving
    });
  },
  initSettings: async () => {
    const result = await SettingsAPI.getSettings();
    set({
      alwaysExecuteCode: result.code_autorun,
      openAiApiKey: result.openai_api_key,
      isApiKeyValid: await get().validateApiKey(result.openai_api_key || ''),
    });
  },
  validateApiKey: async (key: string) => {
    if (!key) {
      return false;
    }
    const { key_ok } = (await SettingsAPI.checkKey(key).json()) as {
      key_ok: boolean;
    };
    if (!key_ok && useProjectStore.getState().isProjectOpen) {
      ProjectsAPI.closeProject();
      showNotification({
        title: 'Error',
        message: 'Invalid Open AI API key.',
        variant: 'error',
      });
    }
    return key_ok;
  },
}));
