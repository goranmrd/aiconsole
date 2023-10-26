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
  AICMessage,
  AICMessageGroup,
  Chat,
} from '../types/types';
import { AICStore } from './AICStore';
import { deepCopyChat } from './utils';
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
  appendEmptyOutput: (groupId?: string, messageId?: string) => void;
  appendTextAtTheEnd: (text: string) => void;
  appendGroup: (group: Omit<AICMessageGroup, 'id'>) => void;
  appendMessage: (
    message:
      | Omit<AICContentMessage, 'id' | 'timestamp'>
      | Omit<AICCodeMessage, 'id' | 'timestamp'>,
    groupId?: string,
  ) => void;
};

export type AICGroupLocator = { groupIndex: number; group: AICMessageGroup };
export type AICMessageLocator = AICGroupLocator & {
  messageIndex: number;
  message: AICMessage;
};
export type AICOutputLocator = AICMessageLocator & {
  outputIndex: number;
  output: AICContentMessage;
};

/**
 *
 * @param groupId if undefined returns last group
 */
export function getGroup(
  chat: Chat,
  groupId?: string,
): AICGroupLocator {
  const groupIndex = groupId
    ? chat.message_groups.findIndex((group) => group.id === groupId)
    : chat.message_groups.length - 1;

  if (groupIndex === -1) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  const group = chat.message_groups[groupIndex];

  return {
    group,
    groupIndex,
  };
}

export function getMessage(
  chat: Chat,
  groupId?: string,
  messageId?: string,
): AICMessageLocator {
  const { group, groupIndex } = getGroup(chat, groupId);

  const messageIndex = messageId
    ? group.messages.findIndex((message) => message.id === messageId)
    : group.messages.length - 1;

  if (messageIndex === -1) {
    throw new Error(`Message with id ${messageId} not found`);
  }

  return {
    groupIndex,
    group,
    messageIndex,
    message: group.messages[messageIndex],
  };
}

export function getOutput(
  chat: Chat,
  groupId?: string,
  messageId?: string,
  outputId?: string,
): AICOutputLocator {
  const messageLocation = getMessage(chat, groupId, messageId);

  if (!('outputs' in messageLocation.message)) {
    throw new Error(`Message with id ${messageId} is not a code message`);
  }

  const outputs = messageLocation.message.outputs;

  const outputIndex = outputId
    ? outputs.findIndex((output) => output.id === outputId)
    : outputs.length - 1;

  if (outputIndex === -1) {
    throw new Error(`Output with id ${outputId} not found`);
  }

  return {
    ...messageLocation,
    outputIndex,
    output: outputs[outputIndex],
  };
}

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
  appendTextAtTheEnd: (text: string) => {
    //append text to last content
    set((state) => {
      const chat = deepCopyChat(state.chat);

      const lastGroup = chat.message_groups[chat.message_groups.length - 1];
      const lastMessage = lastGroup.messages[lastGroup.messages.length - 1];

      if ('outputs' in lastMessage && lastMessage.outputs.length > 0) {
        const lastOutput = lastMessage.outputs[lastMessage.outputs.length - 1];

        lastOutput.content += text;
      } else {
        lastMessage.content += text;
      }

      return {
        chat,
      };
    });
  },
  loadingMessages: false,
  removeMessageFromGroup: (groupId?: string, messageId?: string) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const messageLocation = getMessage(chat, groupId, messageId);

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
  removeOutputFromCode: (
    groupId: string,
    messageId: string,
    outputId: string,
  ) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);
      const outputLocation = getOutput(
        chat,
        groupId,
        messageId,
        outputId,
      );

      if (!('outputs' in outputLocation.message)) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      outputLocation.message.outputs.splice(outputLocation.outputIndex, 1);

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

      const message = getMessage(chat, groupId, messageId).message;
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

      const { outputIndex, message } = getOutput(
        chat,
        groupId,
        messageId,
        outputId,
      );

      if (!('outputs' in message)) {
        throw new Error(`Message with id ${messageId} is not a code message`);
      }

      message.outputs[outputIndex].content = newOutput;

      return {
        chat,
      };
    });

    get().saveCurrentChatHistory();
  },
  appendEmptyOutput: (groupId?: string, messageId?: string) => {
    set((state) => {
      const chat = deepCopyChat(state.chat);

      const message = getMessage(chat, groupId, messageId).message;
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
