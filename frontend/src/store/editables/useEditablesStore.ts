import { create } from 'zustand';
import { AgentsSlice, createAgentsSlice } from './AgentsSlice';
import { MaterialSlice, createMaterialSlice } from './MetarialSlice';
import { ChatsSlice, createChatsSlice } from './ChatsSlice';
import { EdiblesSlice, createEdiblesSlice } from './EdiblesSlice';

export type EditablesStore = AgentsSlice & MaterialSlice & ChatsSlice & EdiblesSlice;

export const useEditablesStore = create<EditablesStore>()((...a) => ({
  ...createAgentsSlice(...a),
  ...createMaterialSlice(...a),
  ...createChatsSlice(...a),
  ...createEdiblesSlice(...a),
}));
