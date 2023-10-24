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

import { v4 as uuidv4 } from 'uuid';

import { AICMessage } from '../types/types';
import { useAICStore } from './AICStore';
import { useDebouncedValue } from '@mantine/hooks';

export function createMessage({
  agent_id,
  role,
  task,
  content,
  materials_ids,
  language,
  code,
  code_output,
}: {
  agent_id: string;
  role: string;
  task?: string;
  content: string;
  materials_ids: string[];
  language?: string;
  code?: boolean;
  code_output?: boolean;
}): AICMessage {
  return {
    agent_id,
    id: uuidv4(),
    role,
    task,
    materials_ids,
    content,
    language,
    code,
    code_output,
    timestamp: new Date().toISOString(),
  };
}

export function useDebouncedPrompt() {
  const prompt = useAICStore(
    (state) => state.commandHistory[state.commandIndex],
  ).trim();
  const [debouncedPrompt] = useDebouncedValue(prompt, 150, { leading: true });

  return debouncedPrompt;
}
