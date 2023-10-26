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
import { createMessage } from './utils';
import { useAnalysisStore } from './useAnalysisStore';

export type ActionSlice = {
  doExecute: (
    agentId: string,
    task: string | undefined,
    materials_ids: string[],
  ) => Promise<void>;
  doRun: () => Promise<void>;
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

  doRun: async () => {
    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));


    const messages = get().flatMessages() || [];
    const lastMessage = messages.at(messages.length - 1);
    if (!lastMessage) {
      throw new Error('No messages');
    }

    const language = lastMessage?.language || 'python';
    const code = lastMessage?.content;
    const agentId = lastMessage?.agent_id;
    const task = lastMessage?.task;
    const materials_ids = lastMessage?.materials_ids;

    try {
      const response = await Api.runCode({
        chatId: get().chatId,
        language,
        code,
        materials_ids,
        signal: get().executeAbortSignal.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      get().appendMessage(
        createMessage({
          agent_id: agentId,
          task: task,
          materials_ids,
          role: 'assistant',
          content: '',
          code_output: true,
        }),
      );

      while (true) {
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const textChunk = decoder.decode(value);

          get().modifyLastMessage((message) => {
            return {
              ...message,
              content: message.content + textChunk,
            };
          });

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
        isExecuteRunning: false,
      }));
    }


    // We ran code, continue operation with the same agent
    console.log('from run output: doExecute');

    //Create new message with the same agent, needed for doExecute
    get().appendMessage(
      createMessage({
        agent_id: agentId,
        task: task,
        materials_ids,
        role: 'assistant',
        content: '',
      }),
    );

    await get().doExecute(agentId, task, materials_ids);
  },

  /**
   * doExecute expects that the last message is the one it should be filling in.
   */
  doExecute: async (agentId: string, task: string | undefined, materials_ids: string[]) => {
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
          messages: get().flatMessages(),
          relevant_materials_ids: materials_ids,
          agent_id: agentId,
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

          const finishMessage = (newMessageProps: object, force: boolean) => {
            if (messageDone || force) {
              get().modifyLastMessage((message) => {
                if (message.content === '') {
                  return undefined
                } else {
                  return message;
                }
              });

              get().appendMessage(
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
                get().modifyLastMessage((message) => {
                  return {
                    ...message,
                    code: false,
                    code_output: false,
                    content: '',
                  }
                });
              }
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
              get().modifyLastMessage((message) => {
                return {
                  ...message,
                  content: message.content + text,
                };
              });
            }
          }

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

      get().modifyLastMessage((message) => {
        if (message.content === '') {
          return undefined
        } else {
          return message;
        }
      });

      get().saveCurrentChatHistory();

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    {
      const messages = get().flatMessages() || [];
      const lastMessage = messages.at(messages.length - 1);

      if (!lastMessage?.code) {
        useAnalysisStore.getState().doAnalysis();
      }

      if (lastMessage?.code && lastMessage.language && get().alwaysExecuteCode) {
        await get().doRun();
      }
    }
  },

  isWorking: () =>
    useAnalysisStore.getState().isAnalysisRunning || get().isExecuteRunning,
  stopWork: () => {
    get().executeAbortSignal.abort();
    useAnalysisStore.getState().analysisAbortController.abort();
  },
});
