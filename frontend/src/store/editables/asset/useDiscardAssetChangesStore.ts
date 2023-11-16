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

import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

type Callback = () => void;

interface DiscardStore {
  isChanged: boolean;
  confirmCallback: null | Callback;
  setIsChanged: (value: boolean) => void;
  setConfirmCallback: (value: null | Callback) => void;
}

const discardStore = createWithEqualityFn<DiscardStore>()((set) => ({
  isChanged: false,
  confirmCallback: null,
  setIsChanged: (isChanged: boolean) => set({ isChanged }),
  setConfirmCallback: (confirmCallback: null | Callback) => set({ confirmCallback }),
}));

export const useDiscardAssetChangesStore = () => discardStore((state) => state, shallow);
