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

import { AICMessage, AICMessageGroup } from '../types/types';
import { AICStore } from './AICStore';
import { deepCopyGroups, shouldCreateNewGroup } from './utils';
import { v4 as uuidv4 } from 'uuid';

export type MessageSlice = {
  loadingMessages: boolean;
  messageGroups: AICMessageGroup[];
  isViableForRunningCode: (message: AICMessage) => boolean;
  removeMessage: (id: string) => void;
  editMessageContent: (id: string, content: string) => void;
  flatMessages: () => AICMessage[];
  setMessagesFromFlatList: (messages: AICMessage[]) => void;
  appendMessage: (...messages: AICMessage[]) => void;
  modifyLastMessage: (
    modify: (message: AICMessage) => AICMessage | undefined,
  ) => void;
};

export const createMessageSlice: StateCreator<
  AICStore,
  [],
  [],
  MessageSlice
> = (set, get) => ({
  messageGroups: [],
  isViableForRunningCode: (message: AICMessage) => {
    // only if there are no more messages in the current section

    for (const group of get().messageGroups) {
      for (const section of group.sections) {
        const lastMessage = section?.messages.at(section.messages.length - 1);

        if (lastMessage?.id === message.id) {
          return true;
        }
      }
    }

    return false;
  },
  loadingMessages: false,
  removeMessage: (id: string) => {
    set((state) => {
      let messageGroups = deepCopyGroups(state.messageGroups);

      for (const group of messageGroups) {
        for (const section of group.sections) {
          const indexOfMessage = section.messages.findIndex(
            (message) => message.id === id,
          );

          if (indexOfMessage === -1) {
            continue;
          }

          section.messages.splice(indexOfMessage, 1);

          if (section.messages.length === 0) {
            group.sections = group.sections.filter(
              (section) => section.messages.length > 0,
            );
          }

          if (group.sections.length === 0) {
            messageGroups = messageGroups.filter(
              (group) => group.sections.length > 0,
            );
          }

          break;
        }
      }

      return {
        messageGroups,
      };
    });

    get().saveCurrentChatHistory();
  },
  editMessageContent: (id: string, content: string) => {
    // update content
    set((state) => {
      const messageGroups = deepCopyGroups(state.messageGroups);

      for (const group of messageGroups) {
        for (const section of group.sections) {
          for (const message of section.messages) {
            if (message.id === id) {
              message.content = content;
            }
          }
        }
      }

      return {
        messageGroups,
      };
    });

    // check if edited message was user message
    const isUserMessage =
      get()
        .flatMessages()
        .find((message) => message.id === id)?.role === 'user';

    get().saveCommandAndMessagesToHistory(content, isUserMessage);
  },
  flatMessages: () => {
    const messages: AICMessage[] = [];

    for (const group of get().messageGroups) {
      for (const section of group.sections) {
        messages.push(...section.messages);
      }
    }

    return messages;
  },
  setMessagesFromFlatList(messages: AICMessage[]) {
    set({ messageGroups: [] });

    get().appendMessage(...messages);
  },
  appendMessage: (...messages: AICMessage[]) => {
    set((state) => {
      const messageGroups = deepCopyGroups(state.messageGroups);

      for (const message of messages) {
        if (shouldCreateNewGroup(message, messageGroups)) {
          messageGroups.push({
            id: uuidv4(),
            agent_id: message.agent_id,
            role: message.role,
            task: message.task,
            materials_ids: message.materials_ids,
            sections: [],
          });
        }

        const lastGroup = messageGroups[messageGroups.length - 1];
        const currrentSectionFoldable = !!message.code || !!message.code_output;
        const shouldCreateNewSection =
          lastGroup.sections.length === 0 ||
          !currrentSectionFoldable ||
          !lastGroup.sections[lastGroup.sections.length - 1].foldable;

        if (shouldCreateNewSection) {
          lastGroup.sections.push({
            id: uuidv4(),
            foldable: currrentSectionFoldable,
            messages: [],
          });
        }

        const lastSection = lastGroup.sections[lastGroup.sections.length - 1];

        lastSection.messages.push(message);
      }

      return {
        messageGroups,
      };
    });

    //get().saveCurrentChatHistory();
  },
  modifyLastMessage: (
    modify: (message: AICMessage) => AICMessage | undefined,
  ) => {
    set((state) => {
      const messageGroups = deepCopyGroups(state.messageGroups);

      const lastGroup = messageGroups[messageGroups.length - 1];
      const lastSection = lastGroup.sections[lastGroup.sections.length - 1];
      const lastMessage = lastSection.messages[lastSection.messages.length - 1];

      const newMessage = modify(lastMessage);

      // if undefined delete
      if (newMessage === undefined) {
        lastSection.messages.pop();

        if (lastSection.messages.length === 0) {
          lastGroup.sections.pop();

          if (lastGroup.sections.length === 0) {
            messageGroups.pop();
          }
        }
      } else {
        lastSection.messages[lastSection.messages.length - 1] = newMessage;
      }

      return {
        messageGroups,
      };
    });

    get().saveCurrentChatHistory();
  },
});
