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

import { EditablesAPI } from '@/api/api/EditablesAPI';
import {
  Agent,
  Asset,
  AssetStatus,
  AssetType,
  Material,
} from '@/types/editables/assetTypes';
import { canThereBeOnlyOneForcedAsset } from '@/utils/editables/canThereBeOnlyOneForcedAsset';
import { create } from 'zustand';
import { useEditablesStore } from '../useEditablesStore';

export type ProjectSlice = {
  selectedAsset?: Asset;
  lastSavedSelectedAsset?: Asset;
  getAsset: (assetType: AssetType, id: string) => Asset | undefined;
  setSelectedAsset: (asset: Asset) => void;
  setAssetStatus: (
    assetType: AssetType,
    id: string,
    status: AssetStatus,
  ) => Promise<void>;
  updateSelectedAsset: (name: string, newId: string) => void;
};

export const useAssetStore = create<ProjectSlice>((set) => ({
  lastSavedSelectedAsset: undefined,
  selectedAsset: undefined,
  getAsset: (assetType: AssetType, id: string): Asset | undefined => {
    if (assetType === 'agent') {
      if (id === 'user') {
        const agent: Agent = {
          id: 'user',
          name: 'You',
          usage: '',
          usage_examples: [],
          system: '',
          type: 'agent',
          defined_in: 'aiconsole',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        };

        return agent;
      }

      if (id === 'new') {
        const agent: Agent = {
          id: 'new_agent',
          name: 'New agent',
          usage: '',
          usage_examples: [],
          system: '',
          type: 'agent',
          defined_in: 'project',
          status: 'enabled',
          gpt_mode: 'quality',
          execution_mode: 'normal',
        };

        return agent;
      }

      return useEditablesStore
        .getState()
        .agents.find((agent) => agent.id === id);
    }

    if (assetType === 'material') {
      if (id === 'new') {
        const material: Material = {
          id: 'new_material',
          name: 'New material',
          usage: '',
          usage_examples: [],
          defined_in: 'project',
          status: 'enabled',
          content_api: '',
          type: 'material',
          content_type: 'static_text',
          content_dynamic_text: '',
          content_static_text: '',
        };

        return material;
      }

      return useEditablesStore
        .getState()
        .materials?.find((material) => material.id === id);
    }

    throw new Error(`Unknown asset type ${assetType}`);
  },
  setSelectedAsset: (asset: Asset) => {
    set({
      selectedAsset: asset,
    });
  },
  setAssetStatus: async (
    assetType: AssetType,
    id: string,
    status: AssetStatus,
  ) => {
    const plural = (assetType + 's') as 'materials' | 'agents';

    useEditablesStore.setState((state) => ({
      [plural]: (state[plural] || []).map((asset) => {
        if (asset.id === id) {
          asset.status = status;
        } else {
          if (canThereBeOnlyOneForcedAsset(assetType)) {
            if (asset.status === 'forced') {
              asset.status = 'enabled';
            }
          }
        }
        return asset;
      }),
    }));

    await EditablesAPI.setAssetStatus(assetType, id, status);
  },
  updateSelectedAsset: (name: string, newId: string) => {
    set(({ selectedAsset }) => {
      const updatedAsset = selectedAsset
        ? { ...selectedAsset, name, id: newId }
        : undefined;

      return {
        selectedAsset: updatedAsset,
      };
    });
  },
}));
