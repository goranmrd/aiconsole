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

import ky, { Hooks } from 'ky';

import {
  Agent,
  Chat,
  ErrorResponse,
  Material,
  MaterialInfo,
  MaterialStatus,
  RecentProject,
  RenderedMaterial,
  Settings,
} from '@/types/types';
import showNotification from '@/utils/showNotification';
import { useAPIStore } from '@/store/useAPIStore';

const hooks: Hooks = {
  beforeError: [
    async (error) => {
      const res = (await error.response.json()) as ErrorResponse;
      showNotification({
        title: 'Error',
        message: res.detail || error.message,
        variant: 'error',
      });
      return error;
    },
  ],
};

export function getBaseURL(): string {
  return useAPIStore.getState().getBaseURL();
}

const execute = (
  body: Chat & { relevant_materials_ids: string[]; agent_id: string },
  signal?: AbortSignal,
) =>
  ky.post(`${getBaseURL()}/execute`, {
    json: { ...body },
    signal,
    timeout: 60000,
    hooks,
  });

const runCode = ({
  chatId,
  signal,
  ...rest
}: {
  chatId: string;
  language: string;
  code: string;
  materials_ids: string[];
  signal?: AbortSignal;
}) =>
  ky.post(`${getBaseURL()}/chats/${chatId}/run_code`, {
    json: rest,
    signal,
    timeout: 60000,
    hooks,
  });

// Commands

const getCommandHistory = () => ky.get(`${getBaseURL()}/commands/history`);

const saveCommandToHistory = (body: object) =>
  ky.post(`${getBaseURL()}/commands/history`, {
    json: { ...body },
    timeout: 60000,
    hooks,
  });

// Chats

const getChatsHistory = () =>
  ky.get(`${getBaseURL()}/chats/headlines`, { hooks });

const getChat: (id: string) => Promise<Chat> = async (id: string) =>
  await ky.get(`${getBaseURL()}/chats/history/${id}`, { hooks }).json();

const deleteChat = (id: string) =>
  ky.delete(`${getBaseURL()}/chats/history/${id}`, { hooks });
const updateChatHeadline = (id: string, headline: string) =>
  ky.post(`${getBaseURL()}/chats/headlines/${id}`, {
    json: { headline },
    hooks,
  });

const saveHistory = (chat: Chat) =>
  ky.post(`${getBaseURL()}/chats/history`, {
    json: { ...chat },
    timeout: 60000,
    hooks,
  });

// Agents

const getAgents: () => Promise<Agent[]> = async () =>
  await ky.get(`${getBaseURL()}/api/agents/`, { hooks }).json();

// Projects

const closeProject = () =>
  ky.post(`${getBaseURL()}/api/projects/close`, { hooks });

// infinite timeout
const chooseProject = (path?: string) =>
  ky.post(`${getBaseURL()}/api/projects/choose`, {
    json: { directory: path },
    hooks,
    timeout: false,
  });

const isProjectDirectory = async (path?: string) =>
  (await ky.post(`${getBaseURL()}/api/projects/is_project`, {
    json: { directory: path },
    hooks,
    timeout: false,
  }).json()) as {
    is_project: boolean;
    path: string;
  }

const getCurrentProject = () =>
  ky.get(`${getBaseURL()}/api/projects/current`, { hooks });

async function getRecentProjects(): Promise<RecentProject[]> {
  return ky.get(`${getBaseURL()}/api/projects/recent`, { hooks }).json();
}

async function removeRecentProject(path: string) {
  return ky.delete(`${getBaseURL()}/api/projects/recent`, {
    json: { path },
    hooks,
  });
}

// Materials

const getMaterials = async () =>
  ky.get(`${getBaseURL()}/api/materials/`, { hooks }).json() as Promise<
    MaterialInfo[]
  >;

const setMaterialStatus = async (id: string, status: MaterialStatus) =>
  ky
    .post(`${getBaseURL()}/api/materials/${id}/status-change`, {
      json: { status, to_global: false },
      hooks,
    })
    .json() as Promise<void>;

const getMaterial = async (id: string) =>
  ky
    .get(`${getBaseURL()}/api/materials/${id}`, { hooks })
    .json() as Promise<Material>;

const saveNewMaterial = async (material: Material) =>
  ky.post(`${getBaseURL()}/api/materials/${material.id}`, {
    json: { ...material },
    timeout: 60000,
    hooks,
  });

const updateMaterial = async (material: Material) =>
  ky.patch(`${getBaseURL()}/api/materials/${material.id}`, {
    json: { ...material },
    timeout: 60000,
    hooks,
  });

const deleteMaterial = async (id: string) => {
  ky.delete(`${getBaseURL()}/api/materials/${id}`, { hooks });
};

const previewMaterial: (
  material: Material,
) => Promise<RenderedMaterial> = async (material: Material) =>
  ky
    .post(`${getBaseURL()}/api/materials/preview`, {
      json: { ...material },
      timeout: 60000,
      hooks,
    })
    .json();

// Analysis

const analyse = (body: Chat, analysis_request_id: string, signal?: AbortSignal) =>
  ky.post(`${getBaseURL()}/api/analyse`, {
    json: { chat: body, analysis_request_id: analysis_request_id },
    signal,
    timeout: 60000,
    hooks,
  });

// Settings

const checkKey = (key: string) => {
  return ky.post(`${getBaseURL()}/api/check_key`, {
    json: { key },
    hooks,
    timeout: false,
  });
};

async function saveSettings(params: { to_global: boolean } & Settings) {
  return ky.patch(`${getBaseURL()}/api/settings`, { json: params, hooks });
}

async function getSettings(): Promise<Settings> {
  return ky.get(`${getBaseURL()}/api/settings`, { hooks }).json();
}

export const Api = {
  execute,
  runCode,
  analyse,
  getAgents,
  getMaterial,
  setMaterialStatus,
  getMaterials,
  previewMaterial,
  closeProject,
  chooseProject,
  isProjectDirectory,
  getCurrentProject,
  getRecentProjects,
  removeRecentProject,
  saveNewMaterial,
  updateMaterial,
  deleteMaterial,
  getCommandHistory,
  getChatsHistory,
  getChat,
  saveCommandToHistory,
  saveHistory,
  deleteChat,
  updateChatHeadline,
  saveSettings,
  getSettings,
  checkKey,
};
