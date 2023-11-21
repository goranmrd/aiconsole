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

import { AICToolCall, AICMessage, AICMessageGroup } from '@/types/editables/chatTypes';
import { ChatStore } from './useChatStore';
import {
  deepCopyChat,
  getGroup,
  getLastGroup,
  getLastMessage,
  getMessage,
  getToolCall,
} from '@/utils/editables/chatUtils';
import { v4 as uuidv4 } from 'uuid';

export type MessageSlice = {
  loadingMessages: boolean;
  isViableForRunningCode: (toolCallId: string) => boolean;
  removeMessageFromGroup: (messageId: string) => void;
  removeToolCallFromMessage: (outputId: string) => void;
  editMessage: (change: (message: AICMessage) => void, messageId: string) => void;
  editToolCall: (change: (output: AICToolCall) => void, outputId: string) => void;
  appendToolCall: (toolCall: Omit<AICToolCall, 'timestamp'>, messageId?: string) => void;
  appendGroup: (group: Omit<AICMessageGroup, 'id'>) => void;
  appendMessage: (message: Omit<AICMessage, 'timestamp'>, groupId?: string) => void;
};

export const createMessageSlice: StateCreator<ChatStore, [], [], MessageSlice> = (set, get) => ({
  isViableForRunningCode: (toolCallId: string) => {
    const chat = get().chat;

    if (!chat) {
      throw new Error('Chat is not initialized');
    }

    try {
      const toolCallLocation = getToolCall(chat, toolCallId);

      if (toolCallLocation) {
        return toolCallLocation.toolCall.output === undefined;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  loadingMessages: false,
  removeMessageFromGroup: (messageId: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);
      const messageLocation = getMessage(chat, messageId);

      if (!messageLocation) {
        throw new Error('Message not found');
      }

      messageLocation.group.messages.splice(messageLocation.messageIndex, 1);

      if (messageLocation.group.messages.length === 0) {
        chat.message_groups.splice(chat.message_groups.indexOf(messageLocation.group), 1);
      }

      return {
        chat,
      };
    });
    get().saveCurrentChatHistory();
  },
  removeToolCallFromMessage: (toolCallId: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);
      const toolCallLocation = getToolCall(chat, toolCallId);

      if (!toolCallLocation) {
        throw new Error(`Tool Call with id ${toolCallId} not found`);
      }

      console.log(`Removing tool call ${toolCallId} from message ${toolCallLocation.message.id}`);
      toolCallLocation.message.tool_calls.splice(toolCallLocation.toolCallIndex, 1);

      if (toolCallLocation.message.tool_calls.length === 0 && toolCallLocation.message.content === '') {
        toolCallLocation.group.messages.splice(toolCallLocation.messageIndex, 1);
      }

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  },
  editMessage: (change: (message: AICMessage) => void, messageId: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);
      const messageLocation = getMessage(chat, messageId);
      if (!messageLocation) {
        console.trace();
        console.error(`Message with id ${messageId} not found in`, chat);
        throw new Error('Message not found');
      }

      if (change) change(messageLocation.message);

      return {
        chat,
      };
    });

    const chat = get().chat;

    if (!chat) {
      throw new Error('Chat is not initialized');
    }
  },
  editToolCall: (change: (toolCall: AICToolCall) => void, toolCallId: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);
      const outputLocation = getToolCall(chat, toolCallId);

      if (!outputLocation) {
        console.trace();
        console.error(`Tool call with id ${toolCallId} not found in`, chat);
        throw new Error(`Tool call with id ${toolCallId} not found`);
      }

      if (change) change(outputLocation.toolCall);

      return {
        chat,
      };
    });
  },
  appendToolCall: (toolCall: AICToolCall, messageId?: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);
      const messageLocation = messageId === undefined ? getLastMessage(chat) : getMessage(chat, messageId);

      if (!messageLocation) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      messageLocation.message.tool_calls.push({
        ...toolCall,
      });

      return {
        chat,
      };
    });
  },
  appendGroup: (group: Omit<AICMessageGroup, 'id'>) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);

      chat.message_groups.push({
        id: uuidv4(),
        ...group,
      });

      return {
        chat,
      };
    });
  },
  appendMessage: (message: Omit<AICMessage, 'timestamp'>, groupId?: string) => {
    set((state) => {
      if (!state.chat) {
        throw new Error('Chat is not initialized');
      }

      const chat = deepCopyChat(state.chat);

      const groupLocation = groupId === undefined ? getLastGroup(chat) : getGroup(chat, groupId);

      if (!groupLocation) {
        throw new Error('Group not found');
      }

      groupLocation.group.messages.push({
        timestamp: new Date().toISOString(),
        ...message,
      });

      return {
        chat,
      };
    });
  },
});
