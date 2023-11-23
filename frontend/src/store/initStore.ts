import { useWebSocketStore } from '../api/ws/useWebSocketStore';
import { useRecentProjectsStore } from './projects/useRecentProjectsStore';
import { useSettingsStore } from './settings/useSettingsStore';
import { useAPIStore } from './useAPIStore';

export const initStore = async () => {
  await useAPIStore.getState().initAPIStore();
  useSettingsStore.getState().initSettings();
  useWebSocketStore.getState().initWebSocket();
  useRecentProjectsStore.getState().initRecentProjects();
};
