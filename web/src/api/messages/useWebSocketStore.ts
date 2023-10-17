import { notifications } from '@mantine/notifications';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { create } from 'zustand';
import { ErrorEvent } from 'reconnecting-websocket/events'
import { useAICStore } from '../../store/AICStore';
import { OutgoingWSMessage } from './outgoingMessages';
import { IncomingWSMessage } from './incomingMessages';

export type WebSockeStore = {
  ws: ReconnectingWebSocket | null;
  initWebSocket: () => void;
  disconnect: () => void;
  sendMessage: (message: OutgoingWSMessage) => void;
};

// Create Zustand store
export const useWebSocketStore = create<WebSockeStore>((set, get) => ({
  ws: null,

  // updated function to init the WebSocket connection
  initWebSocket: () => {
    const ws = new ReconnectingWebSocket(`ws://localhost:8000/ws`);

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (e: MessageEvent) => {
      const data: IncomingWSMessage = JSON.parse(e.data);
      console.log('WebSocket message received: ', data)

      switch (data.type) {
        case 'ErrorWSMessage':
          console.error(data.error);
          notifications.show({
            title: 'Error',
            message: data.error,
            color: 'red',
          });
          break;
        case 'NotificationWSMessage':
          console.log('Notification received: ', data);
          notifications.show({
            title: data.title,
            message: data.message,
          });
          break;
        case 'DebugJSONWSMessage':
          console.log(data.message, data.object);
          break;
        case 'ProjectOpenedWSMessage':
          useAICStore.getState().setProject({
            name: data.name,
            path: data.path,
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

    set({ ws });

    get().sendMessage({
      type: 'SetChatIdWSMessage',
      chat_id: useAICStore.getState().chatId,
    });
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null });
  },

  sendMessage: (message: OutgoingWSMessage) => {
    get().ws?.send(JSON.stringify(message));
  },
}));
