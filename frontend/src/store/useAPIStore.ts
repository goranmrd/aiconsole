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

import { Hooks } from 'ky';

import showNotification from '@/utils/common/showNotification';

type ErrorResponse = {
  detail?: string;
};

export const API_HOOKS: Hooks = {
  beforeError: [
    async (error) => {
      const res = (await error.response.json()) as ErrorResponse;
      console.error(res.detail || error.message);
      showNotification({
        title: 'Error',
        message: `${res.detail || error.message}`,
        variant: 'error',
      });
      return error;
    },
  ],
};

export type APIStore = {
  initAPIStore: () => Promise<void>;
  getBaseURL: () => string;
  getBaseHostWithPort: () => string;
  port?: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAPIStore = create<APIStore>((set, get) => ({
  initAPIStore: async () => {
    return new Promise((resolve) => {
      if (window?.electron?.requestBackendPort === undefined) {
        set({ port: 8000 });
        resolve();
      } else {
        //running from electron, let's wait for port
        window.electron.requestBackendPort().then((port: number) => {
          set({ port });
          resolve();
        });
      }
    });
  },
  getBaseURL: () => {
    return `http://${get().getBaseHostWithPort()}`;
  },
  getBaseHostWithPort: () => {
    const port = get().port;

    if (!port) {
      throw new Error('Port is not set');
    }

    return `localhost:${port}`;
  },
  port: undefined,
}));

// Convinience - shorthand function
export function getBaseURL(): string {
  return useAPIStore.getState().getBaseURL();
}
