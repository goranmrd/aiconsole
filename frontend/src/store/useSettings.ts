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

import { Api } from '@/api/Api';
import showNotification from '@/utils/showNotification';
import { create } from 'zustand';

export type SettingsStore = {
  openAiApiKey?: string | null;
  isApiKeyValid?: boolean;
  setApiKeyValid: (valid: boolean) => void;
  alwaysExecuteCode: boolean;
  initSettings: () => Promise<void>;
  setAutoCodeExecution: (autoRun: boolean) => void;
  setOpenAiApiKey: (key: string) => Promise<void>;
  validateApiKey: (key: string) => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useSettings = create<SettingsStore>((set, get) => ({
  openAiApiKey: undefined,
  isApiKeyValid: false,
  setApiKeyValid: async (valid: boolean) => {
    set({ isApiKeyValid: valid });
  },
  alwaysExecuteCode: false,
  setAutoCodeExecution: async (autoRun: boolean) => {
    await Api.saveSettings({ code_autorun: autoRun, to_global: true });
    set({ alwaysExecuteCode: autoRun });
  },
  setOpenAiApiKey: async (key: string) => {
    await Api.saveSettings({
      openai_api_key: key,
      to_global: true,
    });

    set({ openAiApiKey: key });
  },
  initSettings: async () => {
    const result = await Api.getSettings();
    set({
      alwaysExecuteCode: result.code_autorun,
      openAiApiKey: result.openai_api_key,
      isApiKeyValid: !!result.openai_api_key,
    });
    get().validateApiKey(result.openai_api_key || '');
  },
  validateApiKey: async (key: string) => {
    if (!key) {
      get().setApiKeyValid(false);
      return;
    }
    const { key_ok } = (await Api.checkKey(key).json()) as {
      key_ok: boolean;
    };
    if (!key_ok) {
      Api.closeProject();
      showNotification({
        title: 'Error',
        message: 'Invalid Open AI API key.',
        variant: 'error',
      });
    }
    get().setApiKeyValid(key_ok);
  }
}));
