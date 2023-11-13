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

import { ChatStore } from './useChatStore';
import { ChatAPI } from '../ChatAPI';


export type CommandSlice = {
  commandHistory: string[];
  commandIndex: number;
  historyUp: () => void;
  historyDown: () => void;
  scrollChatToBottom: undefined | ((props: {behavior: "auto" | "smooth" | undefined}) => void);
  setScrollChatToBottom: (scrollChatToBottom: (props: {behavior: "auto" | "smooth" | undefined}) => void) => void;
  newCommand: () => Promise<void>;
  editCommand: (prompt: string) => void;
  getCommand: () => string;
  saveCommandAndMessagesToHistory: (
    command: string,
    isUserCommand: boolean,
  ) => Promise<void>;
  submitCommand: (prompt: string) => Promise<void>;
  initCommandHistory: () => Promise<void>;
};

export const createCommandSlice: StateCreator<ChatStore, [], [], CommandSlice> = (set, get) => ({
  setScrollChatToBottom: (scrollChatToBottom) => set(() => ({ scrollChatToBottom })),
  scrollChatToBottom: undefined,
  commandHistory: [''],
  commandIndex: 0,
  initCommandHistory: async () => {
    const history: string[] = await (await ChatAPI.getCommandHistory()).json();

    set(() => ({
      commandHistory: [...history, ''],
      commandIndex: history.length,
    }));
  },
  historyDown: () => {
    set((state) => ({
      commandIndex: Math.min(
        state.commandHistory.length - 1,
        state.commandIndex + 1,
      ),
    }));
  },
  historyUp: () => {
    set((state) => ({ commandIndex: Math.max(0, state.commandIndex - 1) }));
  },
  newCommand: async () =>
    set((state) => ({
      commandHistory: [...state.commandHistory, ''],
      commandIndex: state.commandHistory.length,
    })),
  editCommand: (command) => {
    set((state) => ({
      commandHistory: [
        ...state.commandHistory.slice(0, state.commandIndex),
        command,
        ...state.commandHistory.slice(
          state.commandIndex + 1,
          state.commandHistory.length,
        ),
      ],
    }));
  },
  getCommand: () => {
    return get().commandHistory[get().commandIndex];
  },
  saveCommandAndMessagesToHistory: async (
    command: string,
    isUserCommand: boolean,
  ) => {
    if (isUserCommand) {
      const history: string[] = await (
        await ChatAPI.saveCommandToHistory({ command })
      ).json();
      set(() => ({
        commandHistory: [...history, ''],
        commandIndex: history.length,
      }));
    }
    get().saveCurrentChatHistory();
  },
  submitCommand: async (command: string) => {
    
    if (get().isExecuteRunning || get().currentAnalysisRequestId) {
      await get().stopWork();
    }
    
    if (command.trim() !== '') {
      get().appendGroup({
        agent_id: 'user',
        task: '',
        materials_ids: [],
        role: 'user',
        messages: [],
      });

      get().appendMessage(
        {
          content: command,
        },
      );

      get().saveCommandAndMessagesToHistory(command, true);
    }
    const scrollChatToBottom = get().scrollChatToBottom;

    if (scrollChatToBottom) {
      scrollChatToBottom({
        behavior: 'smooth'
      });
    }

    await get().doAnalysis();
  },
});
