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
    const sortedByDefinedInMaterials = [...materials].sort((a, b) =>
      a.defined_in.localeCompare(b.defined_in),
    );
    set({
      materials: sortedByDefinedInMaterials,
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
