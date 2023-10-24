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
