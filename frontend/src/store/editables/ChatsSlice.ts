import { StateCreator } from 'zustand';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { Chat, ChatHeadline } from '@/types/editables/chatTypes';
import { EditablesStore } from './useEditablesStore';
import { useProjectStore } from '@/store/projects/useProjectStore';

export type ChatsSlice = {
  chats: ChatHeadline[];
  initChatHistory: () => Promise<void>;
  updateChatItem: (chat: Chat) => void;
};

export const createChatsSlice: StateCreator<
  EditablesStore,
  [],
  [],
  ChatsSlice
> = (set) => ({
  chats: [],
  initChatHistory: async () => {
    set({ chats: [] });
    if (!useProjectStore.getState().isProjectOpen) return;
    try {
      const chats: ChatHeadline[] =
        await EditablesAPI.fetchEditableObjects<ChatHeadline>('chat');
      set(() => ({
        chats: chats,
      }));
    } catch (e) {
      set(() => ({
        chats: [],
      }));
      console.log(e);
    }
  },
  updateChatItem: (updatedChat: Chat) => {
    set(({ chats }) => {
      const updatedChats = chats.map((chat) =>
        chat.id === updatedChat.id ? updatedChat : chat,
      );

      return { chats: updatedChats };
    });
  },
});
