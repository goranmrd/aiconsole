import { notifications } from '@mantine/notifications';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { create } from 'zustand';
import { ErrorEvent } from 'reconnecting-websocket/events'
import { useAICStore } from './AICStore';

export type WebSockeStore = {
  messages: object[];
  ws: ReconnectingWebSocket | null;
  initWebSocket: (chatId: string) => void;
  disconnect: () => void;
  sendMessage: (message: object) => void;
  consumeMessage: (message: object) => void;
};

export type ErrorWSMessage = {
  type: 'ErrorWSMessage';
  error: string;
};

export type NotificationWSMessage = {
  type: 'NotificationWSMessage';
  title: string;
  message: string;
};

export type DebugJSONWSMessage = {
  type: 'DebugJSONWSMessage';
  message: string;
  object: object;
};

export type ProjectOpenedWSMessage = {
  type: 'ProjectOpenedWSMessage';
  name: string;
  path: string;
};


export type WSMessage = ErrorWSMessage | NotificationWSMessage | DebugJSONWSMessage | ProjectOpenedWSMessage;

// Create Zustand store
export const useWebSocketStore = create<WebSockeStore>((set, get) => ({
  messages: [],
  ws: null,

  // updated function to init the WebSocket connection
  initWebSocket: (chatId: string) => {
    const ws = new ReconnectingWebSocket(`ws://localhost:8000/ws/${chatId}`);

    ws.onopen = () => console.log('WebSocket connected');

    ws.onmessage = (e: MessageEvent) => {
      const data: WSMessage = JSON.parse(e.data);
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

      set((state) => ({ messages: [...state.messages, data] }));
    };

    ws.onerror = (e: ErrorEvent) => {
      console.log('WebSocket error: ', e);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      set({ ws: null });
    };

    set({ ws });
  },

  consumeMessage: (message: object) => {
    // Remove the matching message from the messages array
    set((state) => ({
      messages: state.messages.filter((msg) => msg !== message),
    }));
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null });
  },

  sendMessage: (message: object) => {
    get().ws?.send(JSON.stringify(message));
  },
}));
