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

import { AICContentMessage, AICMessage, AICMessageGroup, Chat } from "./chatTypes";

export type AICGroupLocation = { groupIndex: number; group: AICMessageGroup };
export type AICMessageLocation = { messageIndex: number; message: AICMessage; };
export type AICOutputLocaion = { outputIndex: number; output: AICContentMessage; };

/**
 *
 * @param groupId if undefined returns last group
 */
export function getGroup(
  chat: Chat,
  groupId?: string,
): AICGroupLocation {
  const groupIndex = groupId
    ? chat.message_groups.findIndex((group) => group.id === groupId)
    : chat.message_groups.length - 1;

  if (groupIndex === -1) {
    throw new Error(`Group with id ${groupId} not found`);
  }

  const group = chat.message_groups[groupIndex];

  return {
    group,
    groupIndex,
  };
}

/**
 *
 * @param messageId if undefined returns last message
 */
export function getMessage(
  group: AICMessageGroup,
  messageId?: string,
): AICMessageLocation {
  const messageIndex = messageId
    ? group.messages.findIndex((message) => message.id === messageId)
    : group.messages.length - 1;

  if (messageIndex === -1) {
    throw new Error(`Message with id ${messageId} not found`);
  }

  return {
    messageIndex,
    message: group.messages[messageIndex],
  };
}

/**
 * 
 * @param outputId if undefined returns last output
 */
export function getOutput(
  message: AICMessage,
  outputId?: string,
): AICOutputLocaion {
  
  if (!('outputs' in message)) {
    throw new Error(`Message with id ${message.id} is not a code message`);
  }

  const outputs = message.outputs;

  const outputIndex = outputId
    ? outputs.findIndex((output) => output.id === outputId)
    : outputs.length - 1;

  if (outputIndex === -1) {
    throw new Error(`Output with id ${outputId} not found`);
  }

  return {
    outputIndex,
    output: outputs[outputIndex],
  };
}


function deepCopyMessage(message: AICMessage): AICMessage {
  if ('language' in message) {
    const {outputs, ...rest} = message;
    return {
      ...rest,
      outputs: outputs.map((output) => deepCopyMessage(output)),
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