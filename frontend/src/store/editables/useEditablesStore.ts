import { create } from 'zustand';
import { AgentsSlice, createAgentsSlice } from './AgentsSlice';
import { MaterialSlice, createMaterialSlice } from './MetarialSlice';
import { ChatsSlice, createChatsSlice } from './ChatsSlice';
import { EditablesSlice, createEditablesSlice } from './EditablesSlice';

export type EditablesStore = AgentsSlice & MaterialSlice & ChatsSlice & EditablesSlice;

export const useEditablesStore = create<EditablesStore>()((...a) => ({
  ...createAgentsSlice(...a),
  ...createMaterialSlice(...a),
  ...createChatsSlice(...a),
  ...createEditablesSlice(...a),
}));
