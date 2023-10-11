import { notifications } from '@mantine/notifications';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { create } from 'zustand';
import { ErrorEvent } from 'reconnecting-websocket/events'

export type WebSockeStore = {
  messages: object[];
  ws: ReconnectingWebSocket | null;
  initWebSocket: (chatId: string) => void;
  disconnect: () => void;
  sendMessage: (message: object) => void;
  consumeMessage: (message: object) => void;
};

export type ErrorWSMessage = {
  type: 'error';
  error: string;
};

export type NotificationWSMessage = {
  type: 'notification';
  title: string;
  message: string;
};

export type DebugJSONWSMessage = {
  type: 'debug_json';
  message: string;
  object: object;
};


export type WSMessage = ErrorWSMessage | NotificationWSMessage | DebugJSONWSMessage;

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

      switch (data.type) {
        case 'error':
          console.error(data.error);
          notifications.show({
            title: 'Error',
            message: data.error,
            color: 'red',
          });
          break;
        case 'notification':
          console.log('Notification received: ', data);
          notifications.show({
            title: data.title,
            message: data.message,
          });
          break;
        case 'debug_json':
          console.log(data.message, data.object);
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
