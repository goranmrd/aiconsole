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

import { AICStore } from './AICStore';
import { MaterialInfo } from '../types/types';
import { Api } from '@/api/Api';

export type MaterialSlice = {
  materials?: MaterialInfo[];
  initMaterials: () => void;
  fetchMaterials: () => void;
  deleteMaterial: (id: string) => Promise<void>;
};

export const createMaterialSlice: StateCreator<
  AICStore,
  [],
  [],
  MaterialSlice
> = (set, get) => ({
  materials: undefined,
  initMaterials: () => {
    if (get().materials === undefined) {
      set({ materials: [] });
      get().fetchMaterials();
    }
  },
  fetchMaterials: async () => {
    const materials = await Api.getMaterials();

    //sort alphabetically
    materials.sort((a, b) => a.name.localeCompare(b.name));

    //sort by defined_in
    materials.sort((a, b) => {
      const aDefinedIn = a.defined_in === 'project' ? 0 : 1;
      const bDefinedIn = b.defined_in === 'project' ? 0 : 1;
      return aDefinedIn - bDefinedIn;
    })

    //sort by status (forced first, disabled last, enabled in the middle)
    materials.sort((a, b) => {
      const aStatus = a.status === 'forced' ? 0 : a.status === 'enabled' ? 1 : 2;
      const bStatus = b.status === 'forced' ? 0 : b.status === 'enabled' ? 1 : 2;
      return aStatus - bStatus;
    })

    set({
      materials,
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
