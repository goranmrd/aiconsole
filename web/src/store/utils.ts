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

import { AICMessage, AICMessageGroup } from '../types/types';
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

export function findExistingGroupId(
  message: AICMessage,
  existingGroups: AICMessageGroup[],
) {
  for (const group of existingGroups) {
    if (
      group.role === message.role &&
      group.agent_id === message.agent_id &&
      group.task === message.task &&
      group.materials_ids.join('|') === message.materials_ids.join('|')
    ) {
      return group.id;
    }
  }
  return null;
}

export function shouldCreateNewGroup(
  message: AICMessage,
  groups: AICMessageGroup[],
) {
  if (groups.length === 0) return true;

  const lastGroup = groups[groups.length - 1];
  return (
    lastGroup.role !== message.role ||
    lastGroup.agent_id !== message.agent_id ||
    lastGroup.task !== message.task ||
    lastGroup.materials_ids.join('|') !== message.materials_ids.join('|')
  );
}

export function processGroups(
  messages: AICMessage[],
  existingGroups: AICMessageGroup[],
) {
  const groups = [];

  for (const message of messages) {
    if (shouldCreateNewGroup(message, groups)) {
      const existingGroupId = findExistingGroupId(message, existingGroups);

      groups.push({
        id: existingGroupId || uuidv4(),
        agent_id: message.agent_id,
        role: message.role,
        task: message.task || '',
        materials_ids: message.materials_ids,
        sections: [{ id: message.id, foldable: false, messages: [message] }],
      });
    } else {
      groups[groups.length - 1].sections.push({
        id: message.id,
        foldable: false,
        messages: [message],
      });
    }
  }

  return groups;
}

export function makeMessagesFoldable(groups: AICMessageGroup[]) {
  for (const group of groups) {
    for (const microGroup of group.sections) {
      if (microGroup.messages[0].code || microGroup.messages[0].code_output) {
        microGroup.foldable = true;
      }
    }
  }
}

export function joinFoldableGroups(groups: AICMessageGroup[]) {
  for (const group of groups) {
    let i = 0;
    while (i < group.sections.length - 1) {
      if (group.sections[i].foldable && group.sections[i + 1].foldable) {
        group.sections[i].messages = [
          ...group.sections[i].messages,
          ...group.sections[i + 1].messages,
        ];
        group.sections.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }
}
