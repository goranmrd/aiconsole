import { StateCreator } from 'zustand';

import { Chat, ChatHeadline } from './types';
import { Api } from '@/api/Api';
import { AICStore } from './AICStore';
import { useWebSocketStore } from '@/store/useWebSocketStore';

export type ChatSlice = {
  chatId: string;
  alwaysExecuteCode: boolean;
  hasPendingCode: boolean;
  chatHeadlines: ChatHeadline[];
  setChatId: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
  initChatHistory: () => Promise<void>;
  saveCurrentChatHistory: () => Promise<void>;
  updateChatHeadline: (id: string, headline: string) => Promise<void>;
  enableAutoCodeExecution: () => void;
};

export const createChatSlice: StateCreator<AICStore, [], [], ChatSlice> = (
  set,
  get,
) => ({
  chatId: '',
  alwaysExecuteCode: false,
  hasPendingCode: false,
  chatHeadlines: [],
  agent: undefined,
  materials: [],
  enableAutoCodeExecution: () => {
    set({ alwaysExecuteCode: true });
  },
  initChatHistory: async () => {
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
    set(() => ({
      chatId: id,
      messages: undefined,
      alwaysExecuteCode: false,
      hasPendingCode: false,
    }));

    useWebSocketStore.getState().sendMessage({
      type: 'SetChatIdWSMessage',
      chat_id: id,
    });

    let chat: Chat;
    if (id === '') {
      chat = {
        id: '',
        messages: [],
        auto_run: false,
      };
    } else {
      chat = await Api.getChat(id);
    }

    set(() => ({
      messages: (chat.messages || []).map(({ materials_ids, ...rest }) => {
        return {
          materials_ids: materials_ids ? materials_ids : [],
          ...rest,
        };
      }),
      alwaysExecuteCode: chat.auto_run,
    }));
  },
  saveCurrentChatHistory: async () => {
    await Api.saveHistory({
      id: get().chatId,
      auto_run: get().alwaysExecuteCode,
      messages: get().messages,
    });

    await get().initChatHistory();
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
  },
});
