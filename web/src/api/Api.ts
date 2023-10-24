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

import ky from 'ky';

import {
  Agent,
  Chat,
  Material,
  MaterialInfo,
  RenderedMaterial,
  Settings,
} from '@/types/types';

export const BASE_URL = `http://${window.location.hostname}:8000`;

// TODO: Better types for method parameters

const execute = (
  body: Chat & { relevant_materials_ids: string[]; agent_id: string },
  signal?: AbortSignal,
) =>
  ky.post(`${BASE_URL}/execute`, {
    json: { ...body },
    signal,
    timeout: 60000,
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
  });

// Commands

const getCommandHistory = () => ky.get(`${BASE_URL}/commands/history`);

const saveCommandToHistory = (body: object) =>
  ky.post(`${BASE_URL}/commands/history`, {
    json: { ...body },
    timeout: 60000,
  });

// Chats

const getChatsHistory = () => ky.get(`${BASE_URL}/chats/headlines`);

const getChat: (id: string) => Promise<Chat> = async (id: string) =>
  await ky.get(`${BASE_URL}/chats/history/${id}`).json();

const deleteChat = (id: string) => ky.delete(`${BASE_URL}/chats/history/${id}`);
const updateChatHeadline = (id: string, headline: string) =>
  ky.post(`${BASE_URL}/chats/headlines/${id}`, {
    json: { headline },
  });

const saveHistory = (body: object) =>
  ky.post(`${BASE_URL}/chats/history`, { json: { ...body }, timeout: 60000 });

// Agents

const getAgents: () => Promise<Agent[]> = async () =>
  await ky.get(`${BASE_URL}/agents`).json();

// Projects

const chooseProject = () => ky.post(`${BASE_URL}/api/projects/choose`);

const getCurrentProject = () => ky.get(`${BASE_URL}/api/projects/current`);

// Materials

const getMaterials = async () =>
  ky.get(`${BASE_URL}/api/materials/`).json() as Promise<MaterialInfo[]>;

const getMaterial = async (id: string) =>
  ky.get(`${BASE_URL}/api/materials/${id}`).json() as Promise<Material>;

const saveMaterial = async (material: Material) =>
  ky.post(`${BASE_URL}/api/materials/${material.id}`, {
    json: { ...material },
    timeout: 60000,
  });

const deleteMaterial = async (id: string) => {
  ky.delete(`${BASE_URL}/api/materials/${id}`);
};

const previewMaterial: (
  material: Material,
) => Promise<RenderedMaterial> = async (material: Material) =>
  ky
    .post(`${BASE_URL}/api/materials/preview`, {
      json: { ...material },
      timeout: 60000,
    })
    .json();

// Analysis

const analyse = (body: Chat, signal?: AbortSignal) =>
  ky.post(`${BASE_URL}/analyse`, {
    json: { ...body },
    signal,
    timeout: 60000,
  });

// Settings

const saveSettings = (body: Settings) => {
  ky.patch(`${BASE_URL}/api/settings`, { json: { ...body } });
};

const getSettings = () =>
  ky.get(`${BASE_URL}/api/settings`).json() as Promise<Settings>;

export const Api = {
  execute,
  runCode,
  analyse,
  getAgents,
  getMaterial,
  getMaterials,
  previewMaterial,
  chooseProject,
  getCurrentProject,
  saveMaterial,
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
