import { StateCreator } from 'zustand';

import { AICStore } from './AICStore';
import { MaterialInfo } from '../types/types';
import { Api } from '@/api/Api';

export type MaterialSlice = {
  materials: MaterialInfo[];
  fetchMaterials: () => void;
  deleteMaterial: (id: string) => void;
};

export const createMaterialSlice: StateCreator<
  AICStore,
  [],
  [],
  MaterialSlice
> = (set) => ({
  materials: [],
  fetchMaterials: async () => {
    const materials = await Api.getMaterials();

    const sortedAlphabeticallyAiConsoleMaterials = [...materials]
      .filter((material) => material.defined_in === 'aiconsole')
      .sort((a, b) => a.name.localeCompare(b.name));

    const sortedAlphabeticallyProjectMaterials = [...materials]
      .filter((material) => material.defined_in === 'project')
      .sort((a, b) => a.name.localeCompare(b.name));

    set({
      materials: [
        ...sortedAlphabeticallyProjectMaterials,
        ...sortedAlphabeticallyAiConsoleMaterials,
      ],
    });
  },
  deleteMaterial: async (id: string) => {
    await Api.deleteMaterial(id);
    set((state) => ({
      materials: (state.materials || []).filter(
        (material) => material.id !== id,
      ),
    }));
  },
});
