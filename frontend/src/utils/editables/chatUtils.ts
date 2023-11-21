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

import { AICMessage, AICMessageGroup, AICToolCall as AICToolCall, Chat } from '@/types/editables/chatTypes';

export type AICGroupLocation = { groupIndex: number; group: AICMessageGroup };
export type AICMessageLocation = AICGroupLocation & { messageIndex: number; message: AICMessage };
export type AICOutputLocaion = AICMessageLocation & { toolCallIndex: number; toolCall: AICToolCall };

export function getLastGroup(chat: Chat): AICGroupLocation {
  const group = chat.message_groups[chat.message_groups.length - 1];

  if (!group) {
    throw new Error('No groups found');
  }

  return {
    group,
    groupIndex: chat.message_groups.length - 1,
  };
}

export function getGroup(chat: Chat, groupId: string): AICGroupLocation {
  const groupIndex = groupId
    ? chat.message_groups.findIndex((group) => group.id === groupId)
    : chat.message_groups.length - 1;

  if (groupIndex === -1) {
    throw new Error('No groups found');
  }

  const group = chat.message_groups[groupIndex];

  return {
    group,
    groupIndex,
  };
}

export function getLastMessage(chat: Chat): AICMessageLocation {
  const group = chat.message_groups[chat.message_groups.length - 1];
  const message = group.messages[group.messages.length - 1];

  if (!message) {
    throw new Error('No messages found');
  }

  return {
    groupIndex: chat.message_groups.length - 1,
    group,
    messageIndex: group.messages.length - 1,
    message,
  };
}

export function getMessage(chat: Chat, messageId: string): AICMessageLocation | undefined {
  let groupIndex = 0;
  for (const group of chat.message_groups) {
    let messageIndex = 0;
    for (const message of group.messages) {
      if (message.id === messageId) {
        return {
          groupIndex,
          group,
          messageIndex,
          message,
        };
      }

      messageIndex++;
    }
    groupIndex++;
  }
}

export function getLastToolCall(chat: Chat): AICOutputLocaion {
  const group = chat.message_groups[chat.message_groups.length - 1];
  const message = group.messages[group.messages.length - 1];

  if (!('outputs' in message)) {
    throw new Error('Last message is not a code message');
  }

  const toolCall = message.tool_calls[message.tool_calls.length - 1];

  if (!toolCall) {
    throw new Error('No tool_call found');
  }

  return {
    groupIndex: chat.message_groups.length - 1,
    group,
    messageIndex: group.messages.length - 1,
    message,
    toolCallIndex: message.tool_calls.length - 1,
    toolCall,
  };
}

export function getToolCall(chat: Chat, outputId: string): AICOutputLocaion | undefined {
  let groupIndex = 0;
  for (const group of chat.message_groups) {
    let messageIndex = 0;
    for (const message of group.messages) {
      let outputIndex = 0;
      for (const tool_call of message.tool_calls) {
        if (tool_call.id === outputId) {
          return {
            groupIndex,
            group,
            messageIndex,
            message,
            toolCallIndex: outputIndex,
            toolCall: tool_call,
          };
        }
        outputIndex++;
      }
      messageIndex++;
    }
    groupIndex++;
  }

  return undefined;
}

function deepCopyToolCall(toolCall: AICToolCall): AICToolCall {
  return {
    ...toolCall,
  };
}

function deepCopyMessage(message: AICMessage): AICMessage {
  if ('language' in message) {
    const { tool_calls, ...rest } = message;
    return {
      ...rest,
      tool_calls: tool_calls.map((toolCall) => deepCopyToolCall(toolCall)),
    };
  } else {
    return {
      ...message,
    };
  }
}

export function deepCopyGroups(groups: AICMessageGroup[]): AICMessageGroup[] {
  return groups.map((group) => ({
    ...group,
    messages: group.messages.map((message) => deepCopyMessage(message)),
  }));
}

export function deepCopyChat(chat: Chat): Chat {
  return {
    ...chat,
    message_groups: deepCopyGroups(chat.message_groups),
  };
}
