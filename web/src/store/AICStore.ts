import { create } from 'zustand';

import { createMessageSlice } from './MessageSlice';
import { createCommandSlice } from './CommandSlice';
import { createChatSlice } from './ChatSlice';
import { createActionSlice } from './ActionSlice';
import { ProjectSlice, createProjectSlice } from './ProjectSlice';

import { ActionSlice } from './ActionSlice';
import { CommandSlice } from './CommandSlice';
import { ChatSlice } from './ChatSlice';
import { MessageSlice } from './MessageSlice';
import { AgentsSlice, createAgentsSlice } from './AgentsSlice';
import { MaterialSlice, createMaterialSlice } from './MetarialSlice';
import { useAnalysisStore } from './useAnalysisStore';

export type AICStore = MessageSlice &
  CommandSlice &
  ChatSlice &
  ActionSlice &
  AgentsSlice &
  ProjectSlice &
  MaterialSlice;

export const useAICStore = create<AICStore>()((...a) => ({
  ...createMessageSlice(...a),
  ...createCommandSlice(...a),
  ...createChatSlice(...a),
  ...createActionSlice(...a),
  ...createAgentsSlice(...a),
  ...createProjectSlice(...a),
  ...createMaterialSlice(...a),
}));

export const initStore = () => {
  useAICStore.getState().initCommandHistory();
  useAICStore.getState().getSettings();
  useAnalysisStore.getState().init();
};
