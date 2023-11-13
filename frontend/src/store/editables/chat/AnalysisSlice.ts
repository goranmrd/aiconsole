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

import { v4 as uuidv4 } from 'uuid';
import { ChatAPI } from '../../../api/api/ChatAPI';
import { ChatStore, useChatStore } from './useChatStore';

export type AnalysisSlice = {
  agent_id?: string;
  relevant_material_ids?: string[];
  currentAnalysisRequestId?: string;
  next_step?: string;
  thinking_process?: string;
  reset: () => void;
  doAnalysis: () => Promise<void>;
  analysisAbortController: AbortController;
  initAnalytics(): void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createAnalysisSlice: StateCreator<ChatStore, [], [], AnalysisSlice> = (set, get) => ({
  initAnalytics: () => {
    useChatStore.subscribe((state, prevState) => {
      if (
        prevState.chat.id !== state.chat.id ||
        prevState.chat.message_groups.length !== state.chat.message_groups.length ||
        (state.isExecuteRunning && !prevState.isExecuteRunning)
      ) {
        get().reset();
      }
    });
  },
  currentAnalysisRequestId: undefined,
  analysisAbortController: new AbortController(), // Initialize fetchAbortController as undefined
  agent_id: undefined,
  relevant_material_ids: undefined,
  next_step: undefined,
  thinking_process: undefined,
  reset: () => {
    get().analysisAbortController.abort();

    set({
      currentAnalysisRequestId: undefined,
      agent_id: undefined,
      relevant_material_ids: undefined,
      next_step: undefined,
      thinking_process: undefined,
    });
  },
  doAnalysis: async () => {
    const abortController = new AbortController();
    const analysisRequestId = uuidv4();
    set(() => ({}));

    try {
      get().reset();

      set(() => ({
        currentAnalysisRequestId: analysisRequestId,
        analysisAbortController: abortController,
      }));

      const response = await ChatAPI.analyse(useChatStore.getState().chat, analysisRequestId, abortController.signal);

      const data = await response.json<{
        agent_id: string;
        materials_ids: string[];
        next_step: string;
      }>();

      if (get().currentAnalysisRequestId !== analysisRequestId) {
        // another analysis was started
        return;
      }

      set(() => ({
        agent_id: data.agent_id,
        relevant_material_ids: data.materials_ids,
        next_step: data.next_step,
      }));

      if (data.agent_id !== 'user' && data.next_step) {
        useChatStore.getState().appendGroup({
          agent_id: data.agent_id,
          task: data.next_step,
          materials_ids: data.materials_ids,
          role: 'assistant',
          messages: [],
        })
    
        console.log('Executing');
        useChatStore.getState().doExecute();
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return;
      } else {
        throw err;
      }
    } finally {
      if (get().currentAnalysisRequestId === analysisRequestId) {
        set(() => ({
          currentAnalysisRequestId: undefined,
          agent_id: undefined,
          relevant_material_ids: undefined,
          next_step: undefined,
          thinking_process: undefined,
        }));
      }
    }
  },
});
