import { useChatStore } from '@/project/editables/chat/store/useChatStore';
import { useAPIStore } from '../common/useAPIStore';
import { useWebSocketStore } from '../common/ws/useWebSocketStore';
import { useSettingsStore } from '../settings/useSettingsStore';
import { useRecentProjectsStore } from './useRecentProjectsStore';


export const initStore = async () => {
  await useAPIStore.getState().initAPIStore();
  useChatStore.getState().initAnalytics();
  useSettingsStore.getState().initSettings();
  useWebSocketStore.getState().initWebSocket();
  useRecentProjectsStore.getState().initRecentProjects();
};
