import { StateCreator } from 'zustand';

import { ChatHeadline } from './types';
import { Api } from '../api/Api';
import { AICStore } from './AICStore';

export type ChatSlice = {
  chatId: string;
  chatHeadlines: ChatHeadline[];
  setChatId: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
  initChatHistory: () => Promise<void>;
  saveCurrentChatHistory: () => Promise<void>;
};

export const createChatSlice: StateCreator<AICStore, [], [], ChatSlice> = (
  set,
  get,
) => ({
  chatId: '',
  chatHeadlines: [],
  agent: undefined,
  materials: [],
  initChatHistory: async () => {
    const history: ChatHeadline[] = await (await Api.getChatsHistory()).json();

    set(() => ({
      chatHeadlines: [...history],
    }));
  },
  deleteChat: async (id: string) => {
    await Api.deleteChat(id);

    set(() => ({
      chatHeadlines: get().chatHeadlines.filter((chat) => chat.id !== id),
    }));
  },
  setChatId: async (id: string) => {
    set(() => ({
      chatId: id,
      messages: undefined,
    }));

    const chat = await Api.getChat(id);

    set(() => ({
      messages: (chat.messages || []).map(({ materials, ...rest }) => {
        return {
          materials: materials ? materials : [],
          ...rest,
        };
      }),
    }));
  },
  saveCurrentChatHistory: async () => {
    await Api.saveHistory({
      id: get().chatId,
      messages: get().messages,
    });

    await get().initChatHistory();
  },
});


