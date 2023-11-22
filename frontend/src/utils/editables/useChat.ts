import { useCallback } from 'react';

import { EditablesAPI } from '@/api/api/EditablesAPI';
import { useWebSocketStore } from '@/api/ws/useWebSocketStore';
import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { Chat } from '@/types/editables/chatTypes';

export const useChat = () => {
  const setChat = useCallback((chat: Chat) => {
    useWebSocketStore.getState().sendMessage({
      type: 'SetChatIdWSMessage',
      chat_id: chat.id,
    });

    useChatStore.setState(() => {
      return { chat };
    });
  }, []);

  const renameChat = async (newChat: Chat) => {
    await EditablesAPI.updateEditableObject('chat', newChat, newChat.id);
    setChat(newChat);
    //If it's chat we need to reload chat history because there is no autoreload on change for chats
    useEditablesStore.getState().initChatHistory();
  };

  return {
    setChat,
    renameChat,
  };
};
