import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { AICMessage, AICMessageGroup } from '@/types/types';

function findExistingGroupId(
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

function shouldCreateNewGroup(message: AICMessage, groups: AICMessageGroup[]) {
  if (groups.length === 0) return true;

  const lastGroup = groups[groups.length - 1];
  return (
    lastGroup.role !== message.role ||
    lastGroup.agent_id !== message.agent_id ||
    lastGroup.task !== message.task ||
    lastGroup.materials_ids.join('|') !== message.materials_ids.join('|')
  );
}

function processGroups(
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

  makeMessagesFoldable(groups);
  joinFoldableGroups(groups);

  return groups;
}

function makeMessagesFoldable(groups: AICMessageGroup[]) {
  for (const group of groups) {
    for (const microGroup of group.sections) {
      if (microGroup.messages[0].code || microGroup.messages[0].code_output) {
        microGroup.foldable = true;
      }
    }
  }
}

function joinFoldableGroups(groups: AICMessageGroup[]) {
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

const useGroupMessages = (messages: AICMessage[]) => {
  const [groups, setGroups] = useState<AICMessageGroup[]>([]);

  useEffect(() => {
    if (!messages) {
      return;
    }

    const newGroups = processGroups(messages, groups);

    setGroups(newGroups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  return groups;
};

export default useGroupMessages;
