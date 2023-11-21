# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
from aiconsole.core.chat.types import AICMessage, AICMessageGroup, Chat
from aiconsole.consts import FUNCTION_CALL_OUTPUT_LIMIT
from aiconsole.core.gpt.types import (
    GPTFunctionCall,
    GPTRequestMessage,
    GPTRequestTextMessage,
    GPTRequestToolMessage,
    GPTToolCall,
)


from typing import List


last_system_message = None


def convert_message(group: AICMessageGroup, message: AICMessage, is_last: bool) -> List[GPTRequestMessage]:
    global last_system_message

    result = []

    #
    # Augment the messages with system messages with meta data about which agent is speaking and what materials were available
    #

    if group.task:
        system_message = f"""
As a director I have assigned you ({group.agent_id}) and given you access to the following materials text: {", ".join(group.materials_ids) if group.materials_ids else "None"}.
""".strip()

        # Only provide a task for last message
        if is_last:
            system_message += "\n\nYour job: " + group.task

        if last_system_message != system_message:
            result.append(
                GPTRequestTextMessage(
                    role="system",
                    name="director",
                    content=system_message,
                )
            )
            last_system_message = system_message

    tool_calls = [
        GPTToolCall(
            id=tool_call.id,
            function=GPTFunctionCall(
                name=tool_call.language,
                arguments=json.dumps(
                    {
                        "code": tool_call.code,
                    }
                ),
            ),
        )
        for tool_call in message.tool_calls
    ]

    result.append(
        GPTRequestTextMessage(
            role=group.role,
            content=message.content,
            name=group.agent_id if group.agent_id != "user" else None,
            tool_calls=tool_calls or None,
        ),
    )

    for tool_call in message.tool_calls:
        tool_call_id = tool_call.id

        content = tool_call.output

        if content is None:
            result.append(
                GPTRequestToolMessage(
                    tool_call_id=tool_call_id,
                    content="Running...",
                )
            )
        else:
            if content == "":
                content = "No output"

            # Enforce limit on output length, and put info that it was truncated only if limit was reached, truncate so the last part remains (not the first)
            if len(content) > FUNCTION_CALL_OUTPUT_LIMIT:
                content = f"""
Output truncated to last {FUNCTION_CALL_OUTPUT_LIMIT} characters:

...
{content[-FUNCTION_CALL_OUTPUT_LIMIT:]}
""".strip()

            result.append(GPTRequestToolMessage(tool_call_id=tool_call_id, content=content))

    return result


def convert_messages(chat: Chat) -> List[GPTRequestMessage]:
    global last_system_message
    last_system_message = None

    messages: List[GPTRequestMessage] = []

    for message_group in chat.message_groups:
        is_last_group = message_group == chat.message_groups[-1]
        for message in message_group.messages:
            is_last = is_last_group and message == message_group.messages[-1]
            messages.extend(convert_message(message_group, message, is_last=is_last))

    return messages
