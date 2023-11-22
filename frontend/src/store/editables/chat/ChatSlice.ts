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

import { EditablesAPI } from '@/api/api/EditablesAPI';
import { Chat } from '@/types/editables/chatTypes';
import { deepCopyChat } from '@/utils/editables/chatUtils';
import { useEditablesStore } from '../useEditablesStore';
import { ChatStore } from './useChatStore';

export type ChatSlice = {
  chat?: Chat;
  saveCurrentChatHistory: () => Promise<void>;
};

export const createChatSlice: StateCreator<ChatStore, [], [], ChatSlice> = (set, get) => ({
  chat: undefined,
  agent: undefined,
  materials: [],
  saveCurrentChatHistory: async () => {
    const chat = deepCopyChat(get().chat);

    if (chat) {
      // update title
      if (!chat.title_edited && chat.message_groups.length > 0 && chat.message_groups[0].messages.length > 0) {
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
            id: chat.id,
            name: chat.name,
            last_modified: new Date().toISOString(),
          },
          ...useEditablesStore.getState().chats.filter((c) => c.id !== chat.id),
        ],
      });

      await EditablesAPI.updateEditableObject('chat', chat);
    }
  },
});
