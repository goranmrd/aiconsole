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

import { useAICStore } from './AICStore';
import { Api } from '@/api/Api';

export type AnalysisStore = {
  agent_id?: string;
  relevant_material_ids?: string[];
  next_step?: string;
  thinking_process?: string;
  reset: () => void;
  doAnalysis: () => Promise<void>;
  isAnalysisRunning: boolean;
  analysisAbortController: AbortController;
  initAnalytics(): void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  initAnalytics: () => {
    useAICStore.subscribe((state, prevState) => {
      if (
        prevState.chatId !== state.chatId ||
        prevState.chat.message_groups.length !== state.chat.message_groups.length ||
        (state.isExecuteRunning && !prevState.isExecuteRunning)
      ) {
        useAnalysisStore.getState().reset();
      }
    });
  },
  isAnalysisRunning: false,
  analysisAbortController: new AbortController(), // Initialize fetchAbortController as undefined
  agent_id: undefined,
  relevant_material_ids: undefined,
  next_step: undefined,
  thinking_process: undefined,
  reset: () => {
    get().analysisAbortController.abort();

    set({
      agent_id: undefined,
      relevant_material_ids: undefined,
      next_step: undefined,
      thinking_process: undefined,
    });
  },
  doAnalysis: async () => {
    try {
      useAnalysisStore.getState().reset();

      set(() => ({
        isAnalysisRunning: true,
        analysisAbortController: new AbortController(),
      }));

      const response = await Api.analyse(
        useAICStore.getState().chat,
        get().analysisAbortController.signal,
      );

      const data = await response.json<{
        agent_id: string;
        materials_ids: string[];
        next_step: string;
      }>();

      set(() => ({
        agent_id: data.agent_id,
        relevant_material_ids: data.materials_ids,
        next_step: data.next_step,
      }));

      if (get().analysisAbortController.signal.aborted) {
        // If existing fetch operation has been aborted, stop proceeding
        return;
      }

      console.log('Analysis done', data);
      if (data.agent_id !== 'user' && data.next_step) {
        useAICStore.getState().appendGroup({
          agent_id: data.agent_id,
          task: data.next_step,
          materials_ids: data.materials_ids,
          role: 'assistant',
          messages: [],
        })
    
        console.log('Executing');
        useAICStore.getState().doExecute();
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        console.log('Analysis aborted');
        return;
      } else {
        throw err;
      }
    } finally {
      set(() => ({
        isAnalysisRunning: false,
      }));
    }
  },
}));
