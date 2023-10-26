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

import { AICMessage } from '../types/types';
import { AICStore } from './AICStore';

export type MessageSlice = {
  messages: AICMessage[];

  removeMessage: (id: string) => void;
  markMessageAsRan: (id: string) => void;
  editMessageContent: (id: string, content: string) => void;
};

export const createMessageSlice: StateCreator<
  AICStore,
  [],
  [],
  MessageSlice
> = (set, get) => ({
  messages: [],
  removeMessage: (id: string) => {
    set((state) => ({
      messages: (state.messages || []).filter((message) => message.id !== id),
    }));
    get().saveCurrentChatHistory();
  },
  markMessageAsRan: (id: string) => {
    set((state) => ({
      messages: (state.messages || []).map((message) =>
        message.id === id ? { ...message, code_ran: true } : message,
      ),
      hasPendingCode: false,
    }));
    get().saveCurrentChatHistory();
  },
  editMessageContent: (id: string, content: string) => {
    const isUserMessage =
      get().messages?.find((message) => message.id === id)?.role === 'user';

    set((state) => ({
      messages: (state.messages || []).map((message) =>
        message.id === id ? { ...message, content } : message,
      ),
    }));

    get().saveCommandAndMessagesToHistory(content, isUserMessage);
  },
});
