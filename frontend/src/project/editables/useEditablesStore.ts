import { create } from 'zustand';
import { AgentsSlice, createAgentsSlice } from './assets/AgentsSlice';
import { MaterialSlice, createMaterialSlice } from './assets/MetarialSlice';
import { ChatsSlice, createChatsSlice } from './chat/ChatsSlice';

export type EditablesStore = AgentsSlice & MaterialSlice & ChatsSlice;

export const useEditablesStore = create<EditablesStore>()((...a) => ({
  ...createAgentsSlice(...a),
  ...createMaterialSlice(...a),
  ...createChatsSlice(...a),
}));
