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

import ReconnectingWebSocket from 'reconnecting-websocket';
import { create } from 'zustand';
import { ErrorEvent } from 'reconnecting-websocket/events';
import { useAICStore } from './AICStore';
import { OutgoingWSMessage } from '../types/outgoingMessages';
import { IncomingWSMessage } from '../types/incomingMessages';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import showNotification from '@/utils/showNotification';
import { useAPIStore } from './useAPIStore';
import { useSettings } from './useSettings';

export type WebSockeStore = {
  ws: ReconnectingWebSocket | null;
  initWebSocket: () => void;
  disconnect: () => void;
  sendMessage: (message: OutgoingWSMessage) => void;
  initStarted: boolean;
};

// Create Zustand store
export const useWebSocketStore = create<WebSockeStore>((set, get) => ({
  ws: null,
  initStarted: false,

  // updated function to init the WebSocket connection
  initWebSocket: () => {
    if (get().initStarted) return;
    set({ initStarted: true });

    const getBaseHostWithPort = useAPIStore.getState().getBaseHostWithPort;
    const ws = new ReconnectingWebSocket(`ws://${getBaseHostWithPort()}/ws`);

    ws.onopen = () => {
      set({ ws });

      get().sendMessage({
        type: 'SetChatIdWSMessage',
        chat_id: useAICStore.getState().chatId,
      });
    };

    ws.onmessage = async (e: MessageEvent) => {
      const data: IncomingWSMessage = JSON.parse(e.data);

      switch (data.type) {
        case 'ErrorWSMessage':
          console.error(data.error);
          showNotification({
            title: 'Error',
            message: data.error,
            variant: 'error',
          });
          break;
        case 'NotificationWSMessage':
          showNotification({
            title: data.title,
            message: data.message,
          });
          break;
        case 'DebugJSONWSMessage':
          console.log(data.message, data.object);
          break;
        case 'InitialProjectStatusWSMessage':
          if (data.project_path && data.project_name) {
            useAICStore.getState().setProject({
              name: data.project_name || '',
              path: data.project_path,
            });

            await (Promise.all([
              useAICStore.getState().initAgents(),
              useAICStore.getState().initMaterials(),
              useSettings.getState().initSettings(),
            ]))
          } else {
            useAICStore.getState().closeProject();
          }
          break;
        case 'ProjectOpenedWSMessage':
          useAICStore.getState().setProject({
            name: data.name,
            path: data.path,
          });
          break;
        case 'ProjectClosedWSMessage':
          useAICStore.getState().closeProject();
          break;
        case 'ProjectLoadingWSMessage':
          useAICStore.getState().markProjectAsLoading();
          break;
        case 'AssetsUpdatedWSMessage':
          if (data.asset_type === 'agent') {
            //TODO: Fetch agents
            useAICStore.getState().initAgents();
            showNotification({
              title: 'Agents updated',
              message: `${data.count} agents updated`,
            });
          }

          if (data.asset_type === 'material') {
            useAICStore.getState().initMaterials();
            showNotification({
              title: 'Materials updated',
              message: `${data.count} materials updated`,
            });
          }
          break;
        case 'AnalysisUpdatedWSMessage':
          useAnalysisStore.setState({
            agent_id: data.agent_id,
            relevant_material_ids: data.relevant_material_ids,
            next_step: data.next_step,
            thinking_process: data.thinking_process,
          });
          break;
        case 'SettingsWSMessage':
          useSettings.getState().initSettings();
          useAICStore.getState().initMaterials();
          useAICStore.getState().initAgents();
          showNotification({
            title: 'Settings changed',
            message: `New setting activated`,
          });
          break;
      }
    };

    ws.onerror = (e: ErrorEvent) => {
      console.log('WebSocket error: ', e);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      set({ ws: null });
    };
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null });
  },

  sendMessage: (message: OutgoingWSMessage) => {
    get().ws?.send(JSON.stringify(message));
  },
}));
