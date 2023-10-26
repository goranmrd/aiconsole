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
import { MaterialSlice, createMaterialSlice } from './MetarialSlice';
import { useAnalysisStore } from './useAnalysisStore';
import { useWebSocketStore } from './useWebSocketStore';

export type AICStore = MessageSlice &
  CommandSlice &
  ChatSlice &
  ActionSlice &
  AgentsSlice &
  ProjectSlice &
  MaterialSlice;

export const useAICStore = create<AICStore>()((...a) => ({
  ...createMessageSlice(...a),
  ...createCommandSlice(...a),
  ...createChatSlice(...a),
  ...createActionSlice(...a),
  ...createAgentsSlice(...a),
  ...createProjectSlice(...a),
  ...createMaterialSlice(...a),
}));

export const initStore = () => {
  useAICStore.getState().initCommandHistory();
  useAnalysisStore.getState().init();
  useWebSocketStore.getState().initWebSocket();
};
