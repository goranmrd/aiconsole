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
  RenderedMaterial,
  Settings,
} from '@/types/types';
import showNotification from '@/utils/showNotification';

export const BASE_URL = `http://localhost:8000`;

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

const execute = (body: Chat & { relevant_materials_ids: string[]; agent_id: string }, signal?: AbortSignal) =>
  ky.post(`${BASE_URL}/execute`, {
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
  ky.post(`${BASE_URL}/chats/${chatId}/run_code`, {
    json: rest,
    signal,
    timeout: 60000,
    hooks,
  });

// Commands

const getCommandHistory = () => ky.get(`${BASE_URL}/commands/history`);

const saveCommandToHistory = (body: object) =>
  ky.post(`${BASE_URL}/commands/history`, {
    json: { ...body },
    timeout: 60000,
    hooks,
  });

// Chats

const getChatsHistory = () => ky.get(`${BASE_URL}/chats/headlines`, { hooks });

const getChat: (id: string) => Promise<Chat> = async (id: string) =>
  await ky.get(`${BASE_URL}/chats/history/${id}`, { hooks }).json();

const deleteChat = (id: string) => ky.delete(`${BASE_URL}/chats/history/${id}`, { hooks });
const updateChatHeadline = (id: string, headline: string) =>
  ky.post(`${BASE_URL}/chats/headlines/${id}`, {
    json: { headline },
    hooks,
  });

const saveHistory = (chat: Chat) =>
  ky.post(`${BASE_URL}/chats/history`, {
    json: { ...chat },
    timeout: 60000,
    hooks,
  });

// Agents

const getAgents: () => Promise<Agent[]> = async () => await ky.get(`${BASE_URL}/agents`, { hooks }).json();

// Projects

const chooseProject = () => ky.post(`${BASE_URL}/api/projects/choose`, { hooks });

const getCurrentProject = () => ky.get(`${BASE_URL}/api/projects/current`, { hooks });

// Materials

const getMaterials = async () => ky.get(`${BASE_URL}/api/materials/`, { hooks }).json() as Promise<MaterialInfo[]>;

const setMaterialStatus = async (id: string, status: MaterialStatus) =>
  ky.post(`${BASE_URL}/api/materials/${id}/status-change`, { json: { status, to_global: false }, hooks }).json() as Promise<void>;

const getMaterial = async (id: string) =>
  ky.get(`${BASE_URL}/api/materials/${id}`, { hooks }).json() as Promise<Material>;

const saveNewMaterial = async (material: Material) =>
  ky.post(`${BASE_URL}/api/materials/${material.id}`, {
    json: { ...material },
    timeout: 60000,
    hooks,
  });

const updateMaterial = async (material: Material) =>
  ky.patch(`${BASE_URL}/api/materials/${material.id}`, {
    json: { ...material },
    timeout: 60000,
    hooks,
  });

const deleteMaterial = async (id: string) => {
  ky.delete(`${BASE_URL}/api/materials/${id}`, { hooks });
};

const previewMaterial: (material: Material) => Promise<RenderedMaterial> = async (material: Material) =>
  ky
    .post(`${BASE_URL}/api/materials/preview`, {
      json: { ...material },
      timeout: 60000,
      hooks,
    })
    .json();

// Analysis

const analyse = (body: Chat, signal?: AbortSignal) =>
  ky.post(`${BASE_URL}/analyse`, {
    json: { ...body },
    signal,
    timeout: 60000,
    hooks,
  });

// Settings

const saveSettings = (body: Settings) => ky.patch(`${BASE_URL}/api/settings`, { json: { ...body }, hooks });

const getSettings = () => ky.get(`${BASE_URL}/api/settings`, { hooks }).json() as Promise<Settings>;

export const Api = {
  execute,
  runCode,
  analyse,
  getAgents,
  getMaterial,
  setMaterialStatus,
  getMaterials,
  previewMaterial,
  chooseProject,
  getCurrentProject,
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
};
