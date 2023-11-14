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

import ky from "ky";
import { API_HOOKS, getBaseURL } from "../../store/useAPIStore";
import { Chat } from "@/types/editables/chatTypes";


const execute = (chatWithAnalysis: Chat & { relevant_materials_ids: string[]; agent_id: string }, signal?: AbortSignal) =>
  ky.post(`${getBaseURL()}/api/chats/${chatWithAnalysis.id}/execute`, {
    json: { ...chatWithAnalysis },
    signal,
    timeout: 60000,
    hooks: API_HOOKS,
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
    hooks: API_HOOKS,
  });


// Commands

const getCommandHistory = () => ky.get(`${getBaseURL()}/commands/history`);

const saveCommandToHistory = (body: object) =>
  ky.post(`${getBaseURL()}/commands/history`, {
    json: { ...body },
    timeout: 60000,
    hooks: API_HOOKS,
  });



const analyse = (chat: Chat, analysis_request_id: string, signal?: AbortSignal) =>
  ky.post(`${getBaseURL()}/api/chats/${chat.id}/analyse`, {
    json: { chat: chat, analysis_request_id: analysis_request_id },
    signal,
    timeout: 60000,
    hooks: API_HOOKS,
  });


export const ChatAPI = {
  execute,
  runCode,
  analyse,
  getCommandHistory,
  saveCommandToHistory,
};
