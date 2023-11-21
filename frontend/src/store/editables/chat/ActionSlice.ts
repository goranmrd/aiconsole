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

import { getLastGroup, getToolCall } from '@/utils/editables/chatUtils';
import { ChatAPI } from '../../../api/api/ChatAPI';
import { ChatStore, useChatStore } from './useChatStore';
import { AICToolCall } from '@/types/editables/chatTypes';

export type ActionSlice = {
  doExecute: () => Promise<void>;
  doRun: (toolCallId: string) => Promise<void>;
  isExecutionRunning: () => boolean;
  stopWork: () => Promise<void>;
  executeAbortSignal: AbortController;
};

export const createActionSlice: StateCreator<ChatStore, [], [], ActionSlice> = (set, get) => ({
  isExecutionRunning: () => {
    //if any message is streamed, return true

    const chat = get().chat;

    if (!chat) {
      return false;
    }

    for (const group of chat.message_groups) {
      for (const message of group.messages) {
        if (message.is_streaming) {
          return true;
        }

        for (const toolCall of message.tool_calls) {
          if (toolCall.is_streaming || toolCall.is_code_executing) {
            return true;
          }
        }
      }
    }

    return false;
  },

  executeAbortSignal: new AbortController(),

  doRun: async (toolCallId: string) => {
    set(() => ({
      executeAbortSignal: new AbortController(),
    }));

    const chat = get().chat;

    if (!chat) {
      throw new Error('Chat is not initialized');
    }

    const toolCallLocation = getToolCall(chat, toolCallId);

    if (!toolCallLocation) {
      throw new Error('Message not found');
    }

    const toolCall = toolCallLocation.toolCall;

    const language = toolCall.language;
    const code = toolCall.code;
    const materials_ids = toolCallLocation.group.materials_ids;

    useChatStore.getState().editToolCall((toolCall: AICToolCall) => {
      toolCall.output = '';
      toolCall.is_code_executing = true;
    }, toolCallId);

    // We can not meaningfully await the result of the execution, bacause the processing may take more than just the time of this request
    ChatAPI.runCode({
      chatId: get().chat?.id || '',
      tool_call_id: toolCallId,
      language,
      code,
      materials_ids,
      signal: get().executeAbortSignal.signal,
    });
  },

  /**
   * doExecute expects that the last message is the one it should be filling in.
   */
  doExecute: async () => {
    set(() => ({
      executeAbortSignal: new AbortController(),
    }));

    const chat = get().chat;

    if (!chat) {
      throw new Error('Chat is not initialized');
    }

    const lastGroupLocation = getLastGroup(chat);
    const lastGroup = lastGroupLocation.group;

    ChatAPI.execute(
      {
        ...chat,
        relevant_materials_ids: lastGroup.materials_ids,
        agent_id: lastGroup.agent_id,
      },
      get().executeAbortSignal.signal,
    );
  },
  stopWork: async () => {
    get().executeAbortSignal.abort();
    get().resetAnalysis();
  },
});
