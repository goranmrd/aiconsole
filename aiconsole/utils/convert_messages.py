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
from aiconsole.chat.types import AICMessage
from aiconsole.gpt.types import GPTFunctionCall, GPTMessage, GPTRole


from typing import List

from aiconsole.settings import settings


last_system_message = None


def convert_message(message: AICMessage, is_last: bool) -> List[GPTMessage]:
    global last_system_message

    content = message.content
    function_call = None
    name = None
    role: GPTRole = message.role

    result = []

    #
    # Augment the messages with system messages with meta data about which agent is speaking and what materials were available
    #

    # if (message.agent_id != 'user'):
    #    system = f'next message by agent={message.agent_id} with access to materials={[(material.id  if message.materials else "None") for material in message.materials]}'

    if message.task:
        system_message = f"""
As a director I have assigned you ({message.agent_id}) and given you access to the following materials text: {", ".join(f'"{message.materials_ids}"') if message.materials_ids else "None"}.
""".strip()

        # Only provide a task for last message
        if is_last:
            system_message += "\n\nYour job: " + message.task

        if last_system_message != system_message:
            result.append(
                GPTMessage(
                    role="system",
                    name="director",
                    content=system_message,
                )
            )
            last_system_message = system_message

    if message.code:
        function_call = GPTFunctionCall(
            name="execute",
            arguments=json.dumps(
                {
                    "code": message.content,
                    "language": message.language,
                }
            ),
        )
        name = "code"
        role = "assistant"
    elif message.code_output:
        name = "Run"

        if message.content == "":
            content = "No output"

        # Enforce limit on output length, and put info that it was truncated only if limit was reached, truncate so the last part remains (not the first)
        if len(content) > settings.FUNCTION_CALL_OUTPUT_LIMIT:
            content = f"""
Output truncated to last {settings.FUNCTION_CALL_OUTPUT_LIMIT} characters:

...
{content[-settings.FUNCTION_CALL_OUTPUT_LIMIT:]}
""".strip()

        role = "function"
    elif message.agent_id != "user":
        name = message.agent_id

    if content:
        result.append(
            GPTMessage(
                role=role, content=content, function_call=function_call, name=name
            )
        )

    return result


def convert_messages(messages: List[AICMessage]) -> List[GPTMessage]:
    global last_system_message
    last_system_message = None
    # Flatten
    return [
        item
        for sublist in [
            convert_message(message, is_last=index == len(messages) - 1)
            for (index, message) in enumerate(messages)
        ]
        for item in sublist
    ]
