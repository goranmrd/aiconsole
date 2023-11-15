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

export type AssetDefinedIn = 'aiconsole' | 'project';
export const assetDefinedInOptions: AssetDefinedIn[] = ['aiconsole', 'project'];
export type AssetStatus = 'disabled' | 'enabled' | 'forced';
export const assetStatusOptions: AssetStatus[] = ['disabled', 'enabled', 'forced'];
export type MaterialContentType = 'static_text' | 'dynamic_text' | 'api';
export const materialContenTypeOptions: MaterialContentType[] = ['static_text', 'dynamic_text', 'api'];
export type TabsValues = 'chats' | 'materials' | 'agents';

export type Material = Asset & {
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

export type AssetType = 'material' | 'agent';

export type GPTMode = 'quality' | 'speed' | 'cost';

export type EditableObjectType = 'material' | 'agent' | 'chat';

export type EditableObjectTypePlural = 'materials' | 'agents' | 'chats';

export type EditableObject = {
  id: string;
  name: string;
};

export type Asset = EditableObject & {
  usage: string;
  usage_examples: string[];
  defined_in: MaterialDefinitionSource;
  status: AssetStatus;
  default_status: AssetStatus;
  override: boolean;
};

export type Agent = Asset & {
  system: string;
  gpt_mode: GPTMode;
  execution_mode: string;
};
