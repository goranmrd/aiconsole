import { StateCreator } from 'zustand';
import { EditablesAPI } from '../EditablesAPI';
import { ChatHeadline } from '../chat/chatTypes';
import { EditablesStore } from './useEditablesStore';
import { useProjectsStore } from '@/projects/useProjectsStore';

export type ChatsSlice = {
  chats: ChatHeadline[];
  initChatHistory: () => Promise<void>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const createChatsSlice: StateCreator<EditablesStore, [], [], ChatsSlice> = (set, _) => ({
  chats: [],
  initChatHistory: async () => {
    set({ chats: [] });
    if (!useProjectsStore.getState().isProjectOpen) return;
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
