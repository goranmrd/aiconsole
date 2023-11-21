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

import { EditableObject } from './assetTypes';

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

export type AICToolCall = {
  id: string;
  language: string;
  is_code_executing: boolean; //HACK: For now this is frontend only, but if we move message management to backend, this should be moved there as well.
  is_streaming: boolean; //HACK: For now this is frontend only, but if we move message management to backend, this should be moved there as well.
  code: string;
  headline: string;
  output?: string;
};

export type AICMessage = {
  id: string;
  timestamp: string;
  content: string;
  tool_calls: AICToolCall[];
  is_streaming: boolean; //HACK: For now this is frontend only, but if we move message management to backend, this should be moved there as well.
};

export type AICMessageGroup = {
  id: string;
  agent_id: string;
  role: string;
  task: string;
  materials_ids: string[];
  messages: AICMessage[];
};

export type ChatHeadline = EditableObject & {
  last_modified: string;
};

export type Chat = EditableObject & {
  title_edited: boolean;
  last_modified: string;
  message_groups: AICMessageGroup[];
};
