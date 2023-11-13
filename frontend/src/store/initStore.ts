import { useChatStore } from '@/store/editables/chat/useChatStore';
import { useAPIStore } from './useAPIStore';
import { useWebSocketStore } from '../api/ws/useWebSocketStore';
import { useSettingsStore } from './settings/useSettingsStore';
import { useRecentProjectsStore } from './projects/useRecentProjectsStore';


export const initStore = async () => {
  await useAPIStore.getState().initAPIStore();
  useChatStore.getState().initAnalytics();
  useSettingsStore.getState().initSettings();
  useWebSocketStore.getState().initWebSocket();
  useRecentProjectsStore.getState().initRecentProjects();
};
