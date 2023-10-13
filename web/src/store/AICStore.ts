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

export type AICStore =
  MessageSlice &
  CommandSlice &
  ChatSlice &
  ActionSlice &
  AgentsSlice &
  ProjectSlice

export const useAICStore = create<AICStore>()((...a) => ({
  ...createMessageSlice(...a),
  ...createCommandSlice(...a),
  ...createChatSlice(...a),
  ...createActionSlice(...a),
  ...createAgentsSlice(...a),
  ...createProjectSlice(...a),
}));
