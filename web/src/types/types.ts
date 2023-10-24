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

export type AICMessage = {
  agent_id: string;
  id: string;
  role: string;
  task?: string;
  content: string;
  timestamp: string;
  materials_ids: string[];
  language?: string;
  code?: boolean;
  code_ran?: boolean;
  code_output?: boolean;
};

export type AICMessageSection = {
  id: string;
  foldable: boolean;
  messages: AICMessage[];
};

export type AICMessageGroup = {
  id: string;
  agent_id: string;
  role: string;
  task: string;
  materials_ids: string[];
  sections: AICMessageSection[];
};

export type MaterialDefinedIn = 'aiconsole' | 'project';
export const materialDefinedInOptions: MaterialDefinedIn[] = [
  'aiconsole',
  'project',
];
export type MaterialStatus = 'disabled' | 'enabled' | 'forced';
export const materialStatusOptions: MaterialStatus[] = [
  'disabled',
  'enabled',
  'forced',
];
export type MaterialContentType = 'static_text' | 'dynamic_text' | 'api';
export const materialContenTypeOptions: MaterialContentType[] = [
  'static_text',
  'dynamic_text',
  'api',
];

export type Material = {
  id: string;
  name: string;
  usage: string;
  defined_in: MaterialDefinedIn;
  status: MaterialStatus;
  content_type: MaterialContentType;
  content_static_text: string;
  content_dynamic_text: string;
  content_api: string;
};

export type RenderedMaterial = {
  id: string;
  content: string;
  error: string;
};

export type MaterialDefinitionSource = 'aiconsole' | 'project';

export type MaterialInfo = {
  id: string;
  name: string;
  usage: string;
  defined_in: MaterialDefinitionSource;
  status: MaterialStatus;
};

export type ChatHeadline = {
  id: string;
  message: string;
  timestamp: string;
};

export type Chat = {
  id: string;
  messages: AICMessage[];
};

export type Agent = {
  id: string;
  name: string;
  usage: string;
  system: string;
};

export type Settings = {
  code_autorun?: number;
};
