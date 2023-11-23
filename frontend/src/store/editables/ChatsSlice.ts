import { StateCreator } from 'zustand';
import { EditablesAPI } from '../../api/api/EditablesAPI';
import { ChatHeadline } from '@/types/editables/chatTypes';
import { EditablesStore } from './useEditablesStore';
import { useProjectStore } from '@/store/projects/useProjectStore';

export type ChatsSlice = {
  chats: ChatHeadline[];
  initChatHistory: () => Promise<void>;
};

export const createChatsSlice: StateCreator<EditablesStore, [], [], ChatsSlice> = (set) => ({
  chats: [],
  initChatHistory: async () => {
    set({ chats: [] });
    if (!useProjectStore.getState().isProjectOpen) return;
    try {
      const chats: ChatHeadline[] = await EditablesAPI.fetchEditableObjects<ChatHeadline>('chat');
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
});
