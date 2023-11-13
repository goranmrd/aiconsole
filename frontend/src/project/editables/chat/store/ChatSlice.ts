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

import { useWebSocketStore } from '@/common/ws/useWebSocketStore';
import { EditablesAPI } from '@/project/editables/EditablesAPI';
import { Chat } from "../chatTypes";
import { ChatStore } from './useChatStore';
import { deepCopyChat } from '../utils';
import { useProjectsStore } from '@/projects/useProjectsStore';
import { useEditablesStore } from '../../useEditablesStore';

export type ChatSlice = {
  chatId: string;
  chat: Chat;
  copyChat: (id: string, newId: string) => Promise<void>;
  setChatId: (id: string) => void;
  saveCurrentChatHistory: () => Promise<void>;
};

export const createChatSlice: StateCreator<ChatStore, [], [], ChatSlice> = (
  set,
  get,
) => ({
  chatId: '',
  chat: {
    id: '',
    name: '',
    last_modified: new Date().toISOString(),
    title_edited: false,
    message_groups: [],
  },
  
  agent: undefined,
  materials: [],
  copyChat: async (id: string, newId: string) => {
    const chat = await EditablesAPI.fetchEditableObject<Chat>('chat', id);
    chat.id = newId;
    set({
      chat: chat,
    });
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
      
      if (id === '' || !useProjectsStore.getState().isProjectOpen) {
        chat = {
          id: '',
          name: '',
          last_modified: new Date().toISOString(),
          title_edited: false,
          message_groups: [],
        };
      } else {
        chat = await EditablesAPI.fetchEditableObject('chat', id);
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
      chat.name = chat.message_groups[0].messages[0].content;
    }

    //remove empty groups
    chat.message_groups = chat.message_groups.filter((group) => {
      return group.messages.length > 0;
    });

    set({
      chat: chat,
    });

    useEditablesStore.setState({
      chats: [
        {
           id: get().chatId,
           name: chat.name,
           last_modified: new Date().toISOString(),
         },
         ...useEditablesStore.getState().chats.filter((chat) => chat.id !== get().chatId),
       ],
    });

    await EditablesAPI.updateEditableObject('chat', chat);
  }
});
