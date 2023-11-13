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

import { useSettingsStore } from '../../settings/useSettingsStore';
import { ChatAPI } from '../../../api/api/ChatAPI';
import { ChatStore } from './useChatStore';
import { getGroup, getMessage } from '@/utils/editables/chatUtils';

export type ActionSlice = {
  doExecute: () => Promise<void>;
  doRun: (groupId?: string, messageId?: string) => Promise<void>;
  isExecuteRunning: boolean;
  stopWork: () => Promise<void>;
  executeAbortSignal: AbortController;
};

export const createActionSlice: StateCreator<ChatStore, [], [], ActionSlice> = (
  set,
  get,
) => ({
  isExecuteRunning: false,

  executeAbortSignal: new AbortController(),

  doRun: async (groupId?: string, messageId?: string) => {
    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    const lastGroupLocation = getGroup(get().chat, groupId);
    const lastMessageLocation = getMessage(lastGroupLocation.group, messageId);
    const lastMessage = lastMessageLocation.message;

    if (!('language' in lastMessage)) {
      throw new Error('Last message is not a code message');
    }

    const language = lastMessage.language;
    const code = lastMessage.content;
    const materials_ids = lastGroupLocation.group.materials_ids;

    try {
      get().markAsExecuting(true, groupId, messageId);

      const response = await ChatAPI.runCode({
        chatId: get().chatId,
        language,
        code,
        materials_ids,
        signal: get().executeAbortSignal.signal,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      get().appendEmptyOutput(groupId, messageId)

      while (true) {
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const textChunk = decoder.decode(value);

          get().appendTextAtTheEnd(textChunk, groupId, messageId)

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

      get().markAsExecuting(false, groupId, messageId);

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    {
      // If We ran code on the last message, continue operation with the same agent
      const lastGroup = getGroup(get().chat).group;
      const lastMessage = getMessage(lastGroup).message;
      if ((groupId == undefined || lastGroup.id === groupId) && (messageId == undefined || lastMessage.id == messageId)) {
        await get().doExecute();
      }
    }
  },

  /**
   * doExecute expects that the last message is the one it should be filling in.
   */
  doExecute: async () => {

    set(() => ({
      executeAbortSignal: new AbortController(),
      isExecuteRunning: true,
    }));

    try {
      const lastGroup = getGroup(get().chat).group;

      const response = await ChatAPI.execute(
        {
          ...get().chat,
          relevant_materials_ids: lastGroup.materials_ids,
          agent_id: lastGroup.agent_id,
        },
        get().executeAbortSignal.signal,
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let messageDone = true;

      while (true) {
        try {
          const { value, done } = (await reader?.read()) || {
            value: undefined,
            done: true,
          };

          const TOKEN_PROCESSORS = [
            ...['python', 'shell', 'applescript'].map((language) => ({
              token: `<<<< START CODE (${language}) >>>>`,
              processor: () => {
                get().appendMessage({
                  content: '',
                  language,
                  is_code_executing: false,
                  outputs: [],
                });
                messageDone = false;
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
                get().removeMessageFromGroup();
                messageDone = true;
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
              if (messageDone) {
                //new plain message
                get().appendMessage({
                  content: '',
                });
                messageDone = false;
              }
              get().appendTextAtTheEnd(text);
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
      const lastGroup = getGroup(get().chat).group;
      if (lastGroup.messages.length > 0) {
        const lastMessage = getMessage(lastGroup).message;

        if (lastMessage.content === '') {
          get().removeMessageFromGroup();
        }
      }

      get().saveCurrentChatHistory();

      set(() => ({
        isExecuteRunning: false,
      }));
    }

    {
      const lastGroup = getGroup(get().chat).group;
      const lastMessage = getMessage(lastGroup).message;
      const isCode = 'language' in lastMessage;

      if (isCode) {
        if (useSettingsStore.getState().alwaysExecuteCode) {
          await get().doRun();
        }
      } else {
        get().doAnalysis();
      }
    }
  },
  stopWork: async () => {
    get().executeAbortSignal.abort();
    get().analysisAbortController.abort();
  },
});
