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

import {
  AICCodeMessage,
  AICContentMessage,
  AICMessageGroup,
} from '../types/types';
import { AICStore } from './AICStore';
import { deepCopyChat, getGroup, getMessage, getOutput } from './utils';
import { v4 as uuidv4 } from 'uuid';

export type MessageSlice = {
  loadingMessages: boolean;
  isViableForRunningCode: (groupId: string, messageId: string) => boolean;
  removeMessageFromGroup: (groupId?: string, messageId?: string) => void;
  removeOutputFromCode: (
    groupId: string,
    codeId: string,
    outputId: string,
  ) => void;
  editMessageContent: (
    groupId: string,
    messageId: string,
    newContent: string,
  ) => void;
  editOutputContent: (
    groupId: string,
    messageId: string,
    outputId: string,
    newOutput: string,
  ) => void;
  markAsExecuting: (executing: boolean, groupId?: string, messageId?: string) => void;
  appendEmptyOutput: (groupId?: string, messageId?: string) => void;
  appendTextAtTheEnd: (text: string, groupId?: string, messageId?: string) => void;
  appendGroup: (group: Omit<AICMessageGroup, 'id'>) => void;
  appendMessage: (
    message:
      | Omit<AICContentMessage, 'id' | 'timestamp'>
      | Omit<AICCodeMessage, 'id' | 'timestamp'>,
    groupId?: string,
  ) => void;
};

export const createMessageSlice: StateCreator<
  AICStore,
  [],
  [],
  MessageSlice
> = (set, get) => ({

  isViableForRunningCode: (groupId: string, messageId: string) => {
    const message = get()
      .chat.message_groups.find((group) => group.id === groupId)
      ?.messages.find((message) => message.id === messageId);
    if (message && 'outputs' in message) {
      return message.outputs.length === 0;
    } else {
      return false;
    }
  },
  appendTextAtTheEnd: (text: string, groupId?: string, messageId?: string, ) => {
    //append text to last content
    set((state) => {
      const chat = deepCopyChat(state.chat);

      const group = getGroup(chat, groupId).group;
      const message = getMessage(group, messageId).message;

      if ('outputs' in message && message.outputs.length > 0) {
        const lastOutput = message.outputs[message.outputs.length - 1];

        lastOutput.content += text;
      } else {
        message.content += text;
      }

      return {
        chat,
      };
    });
  },
  markAsExecuting: (executing: boolean, groupId?: string, messageId?: string, ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const group = getGroup(chat, groupId).group;
      const message = getMessage(group, messageId).message;

      if (!('language' in message)) {
        throw new Error('Last message is not a code message');
      }

      message.is_code_executing = executing;

      return {
        chat,
      };
    });
  },
  loadingMessages: false,
  removeMessageFromGroup: (groupId?: string, messageId?: string) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const groupLocation = getGroup(chat, groupId);
      const messageLocation = getMessage(groupLocation.group, messageId);

      groupLocation.group.messages.splice(messageLocation.messageIndex, 1);

      if (groupLocation.group.messages.length === 0) {
        chat.message_groups.splice(chat.message_groups.indexOf(groupLocation.group), 1);
      }

      return {
        chat,
      };
    });
    get().saveCurrentChatHistory();
  },
  removeOutputFromCode: (
    groupId: string,
    messageId: string,
    outputId: string,
  ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const groupLocation = getGroup(chat, groupId);
      const messageLocation = getMessage(groupLocation.group, messageId);
      const outputLocation = getOutput(messageLocation.message,outputId);

      if (!('outputs' in messageLocation.message)) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      messageLocation.message.outputs.splice(outputLocation.outputIndex, 1);

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  },
  editMessageContent: (
    groupId: string,
    messageId: string,
    newContent: string,
  ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const groupLocation = getGroup(chat, groupId);
      const messageLocation = getMessage(groupLocation.group, messageId);
      const message = messageLocation.message;

      if ('code' in message) {
        message.code = newContent;
      } else {
        message.content = newContent;
      }

      return {
        chat,
      };
    });

    const group = getGroup(get().chat, groupId).group;

    get().saveCommandAndMessagesToHistory(newContent, group.role === 'user');
  },
  editOutputContent: (
    groupId: string,
    messageId: string,
    outputId: string,
    newOutput: string,
  ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const groupLocation = getGroup(chat, groupId);
      const messageLocation = getMessage(groupLocation.group, messageId);
      const outputLocation = getOutput(messageLocation.message,outputId);

      if (!('outputs' in messageLocation.message)) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      messageLocation.message.outputs[outputLocation.outputIndex].content = newOutput;

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  },
  appendEmptyOutput: (groupId?: string, messageId?: string) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const groupLocation = getGroup(chat, groupId);
      const messageLocation = getMessage(groupLocation.group, messageId);
      const message = messageLocation.message;
      
      if (!('outputs' in message)) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      message.outputs.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        content: '',
      });

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  },
  appendGroup: (group: Omit<AICMessageGroup, 'id'>) => {
    set((state) => {
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
  appendMessage: (
    message:
      | Omit<AICContentMessage, 'id' | 'timestamp'>
      | Omit<AICCodeMessage, 'id' | 'timestamp'>,
    groupId?: string,
  ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat)

      const group = getGroup(chat, groupId).group;

      group.messages.push({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        ...message,
      });

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  }
});
