import { StateCreator } from 'zustand';

import { Api } from '@/api/Api';
import { AICStore } from './AICStore';
import { createMessage } from './utils';
import { useAnalysisStore } from './useAnalysisStore';

export type ActionSlice = {
  doExecute: (
    agentId: string,
    task: string,
    materials_ids: string[],
  ) => Promise<void>;
  doRun: (
    agentId: string,
    task: string,
    material_ids: string[],
    language: string,
    code: string,
  ) => Promise<void>;
  isExecuteRunning: boolean;
  isWorking: () => boolean;
  stopWork: () => void;
  executeAbortSignal: AbortController;
};

export const createActionSlice: StateCreator<AICStore, [], [], ActionSlice> = (
  set,
  get,
) => ({
  isExecuteRunning: false,

  executeAbortSignal: new AbortController(),

  doRun: async (
    agentId: string,
    task: string,
    materials_ids: string[],
    language: string,
    code: string,
  ) => {
    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    let messages = get().messages || [];

    messages[messages.length - 1].code_ran = true;

    set(() => ({
      messages: messages.slice(),
    }));

    try {
      const response = await Api.runCode({
        chatId: get().chatId,
        language,
        code,
        materials_ids: materials_ids,
        signal: get().executeAbortSignal.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      set(({ messages }) => ({
        messages: [
          ...(messages || []),
          createMessage({
            agent_id: agentId,
            task: task,
            materials_ids,
            role: 'assistant',
            content: '',
            code_output: true,
          }),
        ],
      }));

      while (true) {
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const textChunk = decoder.decode(value);

          messages = get().messages || [];

          messages[messages.length - 1].content += textChunk;

          set(() => ({
            messages: messages.slice(),
          }));

          if (done) {
            break;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            console.log('Execution operation aborted');
            return;
          } else {
            throw err;
          }
        }
      }
    } finally {
      get().saveCurrentChatHistory();

      set(() => ({
        hasPendingCode: false,
        isExecuteRunning: false,
      }));
    }

    // We ran code, continue operation with the same agent
    console.log('from run output: doExecute');

    //Create new message with the same agent, needed for doExecute
    set(() => {
      const newMessages = (get().messages || []).slice();

      newMessages.push(
        createMessage({
          agent_id: agentId,
          task: task,
          materials_ids,
          role: 'assistant',
          content: '',
        }),
      );
      return {
        messages: newMessages,
      };
    });

    await get().doExecute(agentId, task, materials_ids);
  },

  /**
   * doExecute expects that the last message is the one it should be filling in.
   */
  doExecute: async (agentId: string, task: string, materials_ids: string[]) => {
    const commonMessageAspects = {
      agent_id: agentId,
      task: task,
      materials_ids,
      role: 'assistant',
      content: '',
    };

    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    try {
      const response = await Api.execute(
        {
          id: get().chatId,
          // Add an empty message containing parameters of the current task so backend can use it for this execution
          messages: [...(get().messages || [])],
          relevant_materials_ids: materials_ids,
          agent_id: agentId,
          auto_run: get().alwaysExecuteCode,
        },
        get().executeAbortSignal.signal,
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let messageDone = false;

      while (true) {
        // this is temporary
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const messages = get().messages || [];

          const finishMessage = (newMessageProps: object, force: boolean) => {
            if (messageDone || force) {
              if (messages[messages.length - 1].content === '') {
                messages.pop();
              }

              messages.push(
                createMessage({
                  ...commonMessageAspects,
                  ...newMessageProps,
                }),
              );
              messageDone = false;
            }
          };

          const TOKEN_PROCESSORS = [
            ...['python', 'shell', 'applescript'].map((language) => ({
              token: `<<<< START CODE (${language}) >>>>`,
              processor: () => {
                finishMessage({ language, code: true }, true);
              },
            })),
            {
              token: '<<<< END CODE >>>>',
              processor: () => {
                if (messageDone) throw new Error('Invalid chunk');
                messageDone = true;
              },
            },
            {
              token: '<<<< CLEAR >>>>',
              processor: () => {
                finishMessage({}, false);
                messages[messages.length - 1].content = '';
              },
            },
          ];

          const textChunk = decoder.decode(value);

          const escapeRegExp = (string: string) =>
            string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const tokens = TOKEN_PROCESSORS.map((processor) => processor.token);
          const regexPattern = new RegExp(
            `(${tokens.map(escapeRegExp).join('|')})`,
            'g',
          );
          const splitText = textChunk
            .split(regexPattern)
            .filter((text) => text !== '');

          console.log(splitText);
          for (const text of splitText) {
            let consumed = false;
            TOKEN_PROCESSORS.forEach((tokenProcessor) => {
              if (text === tokenProcessor.token) {
                tokenProcessor.processor();
                consumed = true;
              }
            });

            if (!consumed) {
              finishMessage({}, false);
              messages[messages.length - 1].content += text;
            }
          }

          set(() => ({
            messages: messages.slice(),
          }));

          if (done) {
            break;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') {
            console.log('Execution operation aborted');
            return;
          } else {
            throw err;
          }
        }
      }
    } finally {
      //If the message is still empty, remove it

      set(({ messages }) => {
        if (messages !== undefined) {
          if (messages[messages.length - 1].content === '') {
            return {
              messages: messages.slice(0, -1),
            };
          }
        }

        return {
          messages,
        };
      });

      get().saveCurrentChatHistory();

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    const messages = get().messages || [];
    const language = messages[messages.length - 1].language;
    const code = messages[messages.length - 1].code;
    const executeCode = get().alwaysExecuteCode;

    if (code) {
      set({ hasPendingCode: true });
    }

    if (messages.length > 0 && code && language && executeCode) {
      console.log('Running code');
      await get().doRun(
        agentId,
        task,
        materials_ids,
        language,
        messages[messages.length - 1].content,
      );
    }

    if (!code) {
      console.log('Analysing');
      await useAnalysisStore.getState().doAnalysis();
    }
  },

  isWorking: () =>
    useAnalysisStore.getState().isAnalysisRunning || get().isExecuteRunning,
  stopWork: () => {
    get().executeAbortSignal.abort();
    useAnalysisStore.getState().reset();
  },
});
