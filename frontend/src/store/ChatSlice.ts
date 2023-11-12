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

import { Chat, ChatHeadline } from '../types/types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';
import { deepCopyChat } from './utils';

export type ChatSlice = {
  chatId: string;
  chat: Chat;
  copyChat: (id: string, newId: string) => Promise<void>;
  chatHeadlines: ChatHeadline[];
  setChatId: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
  initChatHistory: () => Promise<void>;
  saveCurrentChatHistory: () => Promise<void>;
  updateChatHeadline: (id: string, headline: string) => Promise<void>;
};

export const createChatSlice: StateCreator<AICStore, [], [], ChatSlice> = (
  set,
  get,
) => ({
  chatId: '',
  chat: {
    id: '',
    title: '',
    last_modified: new Date().toISOString(),
    title_edited: false,
    message_groups: [],
  },
  chatHeadlines: [],
  agent: undefined,
  materials: [],
  copyChat: async (id: string, newId: string) => {
    const chat = await Api.getChat(id);
    chat.id = newId;
    set({
      chat: chat,
    });
  },
  initChatHistory: async () => {
    set({ chatHeadlines: [] });
    if (!get().isProjectOpen) return;
    try {
      const history: ChatHeadline[] = await (
        await Api.getChatsHistory()
      ).json();
      set(() => ({
        chatHeadlines: [...history],
      }));
    } catch (e) {
      set(() => ({
        chatHeadlines: [],
      }));
      console.log(e);
    }
  },
  deleteChat: async (id: string) => {
    await Api.deleteChat(id);

    set(() => ({
      chatHeadlines: get().chatHeadlines.filter((chat) => chat.id !== id),
    }));
  },
  setChatId: async (id: string) => {
    set({
      chatId: id,
      loadingMessages: true
    });

    try {
      useWebSocketStore.getState().sendMessage({
        type: 'SetChatIdWSMessage',
        chat_id: id,
      });
  
      let chat: Chat;
      
      if (id === '' || !get().isProjectOpen) {
        chat = {
          id: '',
          title: '',
          last_modified: new Date().toISOString(),
          title_edited: false,
          message_groups: [],
        };
      } else {
        chat = await Api.getChat(id);
      }
      set({
        chat: chat,
      });
    } finally {
      set({
        loadingMessages: false,
      });
    }
  },
  saveCurrentChatHistory: async () => {
    const chat = deepCopyChat(get().chat);

    // update title
    if (!chat.title_edited && chat.message_groups.length > 0 &&chat.message_groups[0].messages.length > 0) {
      chat.title = chat.message_groups[0].messages[0].content;
    }

    //remove empty groups
    chat.message_groups = chat.message_groups.filter((group) => {
      return group.messages.length > 0;
    });

    set({
      chat: chat,
      chatHeadlines: [
       {
          id: get().chatId,
          message: chat.title,
          timestamp: new Date().toISOString(),
        },
        ...get().chatHeadlines.filter((chat) => chat.id !== get().chatId),
      ],
    });

    await Api.saveHistory(chat);
  },
  updateChatHeadline: async (id: string, headline: string) => {
    const editedHeadline = get().chatHeadlines.find((chat) => chat.id === id);
    const editedHeadlineIndex = get().chatHeadlines.findIndex(
      (chat) => chat.id === id,
    );

    if (!editedHeadline) return;
    editedHeadline.message = headline;
    set(() => ({
      chatHeadlines: [
        ...get().chatHeadlines.slice(0, editedHeadlineIndex),
        editedHeadline,
        ...get().chatHeadlines.slice(editedHeadlineIndex + 1),
      ],
    }));

    await Api.updateChatHeadline(id, headline);

    //force reload of the chat
    get().setChatId(id);
  },
});
