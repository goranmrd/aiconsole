import { create } from 'zustand';

import { useAICStore } from './AICStore';
import { Api } from '@/api/Api';
import { createMessage } from './utils';

export type AnalysisStore = {
  agent_id?: string;
  relevant_material_ids?: string[];
  next_step?: string;
  thinking_process?: string;
  reset: () => void;
  doAnalysis: () => Promise<void>;
  isAnalysisRunning: boolean;
  analysisAbortController: AbortController;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
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
    get().reset();

    try {
      set(() => ({
        analysisAbortController: new AbortController(),
        isAnalysisRunning: true,
      }));
      const response = await Api.analyse(
        {
          id: useAICStore.getState().chatId,
          messages: useAICStore.getState().messages,
          auto_run: useAICStore.getState().alwaysExecuteCode,
        },
        get().analysisAbortController.signal,
      );

      const data = await response.json<{
        agent_id: string;
        materials_ids: string[];
        used_tokens: number;
        available_tokens: number;
        next_step: string;
      }>();

      if (get().analysisAbortController.signal.aborted) {
        // If existing fetch operation has been aborted, stop proceeding
        return;
      }

      const { hasPendingCode } = useAICStore.getState();

      if (data.agent_id !== 'user' && data.next_step && !hasPendingCode) {
        useAICStore.setState(() => {
          const newMessages = (useAICStore.getState().messages || []).slice();
          //push next step
          newMessages.push(
            createMessage({
              agent_id: data.agent_id,
              task: data.next_step,
              materials_ids: data.materials_ids,
              role: 'assistant',
              content: '',
            }),
          );
          return {
            messages: newMessages,
          };
        });

        if (data.agent_id !== 'user' && !hasPendingCode) {
          console.log('Executing');
          useAICStore
            .getState()
            .doExecute(data.agent_id, data.next_step, data.materials_ids);
        }
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
