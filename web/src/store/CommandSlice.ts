import { StateCreator } from 'zustand';

import { AICStore } from './AICStore';
import { Api } from '@/api/Api';
import { createMessage } from './utils';
import { useAnalysisStore } from './useAnalysisStore';

export type CommandSlice = {
  commandHistory: string[];
  commandIndex: number;
  historyUp: () => void;
  historyDown: () => void;
  newCommand: () => void;
  editCommand: (prompt: string) => void;
  getCommand: () => string;
  saveCommandAndMessagesToHistory: (
    command: string,
    isUserCommand: boolean,
  ) => Promise<void>;
  submitCommand: (prompt: string) => void;
  initCommandHistory: () => void;
};

export const createCommandSlice: StateCreator<
  AICStore,
  [],
  [],
  CommandSlice
> = (set, get) => ({
  commandHistory: [''],
  commandIndex: 0,
  initCommandHistory: async () => {
    const history: string[] = await (await Api.getCommandHistory()).json();

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
  newCommand: () =>
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
        await Api.saveCommandToHistory({ command })
      ).json();
      set(() => ({
        commandHistory: [...history, ''],
        commandIndex: history.length,
      }));
    }
    get().saveCurrentChatHistory();
  },
  submitCommand: async (command: string) => {
    if (command.trim() !== '') {
      set(() => ({
        messages: [
          ...(get().messages || []),
          createMessage({
            agent_id: 'user',
            materials_ids: [],
            role: 'user',
            content: command,
          }),
        ],
      }));

      get().saveCommandAndMessagesToHistory(command, true);
    }

    await useAnalysisStore.getState().doAnalysis();
  },
});
