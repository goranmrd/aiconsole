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

// Analysis

import ky from 'ky';
import { API_HOOKS, getBaseURL } from '../../store/useAPIStore';
import { Chat } from '@/types/editables/chatTypes';

const execute = async ({
  chat,
  signal,
  ...rest
}: {
  request_id: string;
  chat: Chat;
  relevant_materials_ids: string[];
  agent_id: string;
  signal?: AbortSignal;
}) => {
  await ky.post(`${getBaseURL()}/api/chats/${chat.id}/execute`, {
    json: { chat, ...rest },
    signal,
    timeout: 60000,
    hooks: API_HOOKS,
  });
};

const runCode = async ({
  chatId,
  signal,
  ...rest
}: {
  request_id: string;
  chatId: string;
  language: string;
  code: string;
  materials_ids: string[];
  signal?: AbortSignal;
  tool_call_id: string;
}) => {
  await ky.post(`${getBaseURL()}/chats/${chatId}/run_code`, {
    json: rest,
    signal,
    timeout: 60000,
    hooks: API_HOOKS,
  });
};

// Commands

const getCommandHistory = () => ky.get(`${getBaseURL()}/commands/history`);

const saveCommandToHistory = (body: object) =>
  ky.post(`${getBaseURL()}/commands/history`, {
    json: { ...body },
    timeout: 60000,
    hooks: API_HOOKS,
  });

const analyse = async ({ chat, request_id, signal }: { chat: Chat; request_id: string; signal?: AbortSignal }) => {
  await ky.post(`${getBaseURL()}/api/chats/${chat.id}/analyse`, {
    json: { chat: chat, request_id: request_id },
    signal,
    timeout: 60000,
    hooks: API_HOOKS,
  });
};

export const ChatAPI = {
  execute,
  runCode,
  analyse,
  getCommandHistory,
  saveCommandToHistory,
};
