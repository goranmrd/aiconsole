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
import { useChatStore } from '../../store/editables/chat/useChatStore';
import { OutgoingWSMessage } from './outgoingMessages';
import { IncomingWSMessage } from './incomingMessages';
import showNotification from '@/utils/common/showNotification';
import { useAPIStore } from '../../store/useAPIStore';
import { useSettingsStore } from '../../store/settings/useSettingsStore';
import { useProjectStore } from '@/store/projects/useProjectStore';
import { useEditablesStore } from '@/store/editables/useEditablesStore';
import { handleChatMessage } from './chat/handleChatMessage';

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

      const chatId = useChatStore.getState().chat?.id || '';

      get().sendMessage({
        type: 'SetChatIdWSMessage',
        chat_id: chatId,
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
            message: `${data.message}`,
          });
          break;
        case 'DebugJSONWSMessage':
          console.log(data.message, data.object);
          break;
        case 'InitialProjectStatusWSMessage':
          if (data.project_path && data.project_name) {
            useProjectStore.getState().onProjectOpened({
              name: data.project_name,
              path: data.project_path,
              initial: true,
            });
          } else {
            useProjectStore.getState().onProjectClosed();
          }
          break;
        case 'ProjectOpenedWSMessage':
          useProjectStore.getState().onProjectOpened({
            name: data.name,
            path: data.path,
            initial: false,
          });
          break;
        case 'ProjectClosedWSMessage':
          useProjectStore.getState().onProjectClosed();
          break;
        case 'ProjectLoadingWSMessage':
          useProjectStore.getState().onProjectLoading();
          break;
        case 'AssetsUpdatedWSMessage':
          if (data.asset_type === 'agent') {
            useEditablesStore.getState().initAgents();
            if (!data.initial) {
              showNotification({
                title: 'Agents updated',
                message: `Loaded ${data.count} agents.`,
              });
            }
          }

          if (data.asset_type === 'material') {
            useEditablesStore.getState().initMaterials();
            if (!data.initial) {
              showNotification({
                title: 'Materials updated',
                message: `Loaded ${data.count} materials.`,
              });
            }
          }
          break;

        case 'SettingsWSMessage':
          useSettingsStore.getState().initSettings();
          useEditablesStore.getState().initMaterials();
          useEditablesStore.getState().initAgents();
          if (!data.initial) {
            showNotification({
              title: 'Settings updated',
              message: `Loaded new settings.`,
            });
          }
          break;
        case 'ResetMessageWSMessage':
        case 'UpdateAnalysisWSMessage':
        case 'UpdateMessageWSMessage':
        case 'UpdateToolCallWSMessage':
        case 'UpdateToolCallOutputWSMessage':
          await handleChatMessage(data);
          break;
        default:
          console.error('Unknown message type: ', data);
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
