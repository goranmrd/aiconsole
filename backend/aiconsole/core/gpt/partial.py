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
    
from typing import List, Optional
from pydantic import BaseModel
from aiconsole.core.gpt.types import GPTChoice, GPTFunctionCall, GPTMessage, GPTResponse, GPTRole
import json
from typing import Union

def _parse_partial_json(s: str) -> Union[dict, str]:
    try:
        return json.loads(s)
    except json.JSONDecodeError:
        pass

    closing_chars_stack = []
    escaped = False
    completed_string = []

    for char in s:
        if closing_chars_stack and closing_chars_stack[-1] == '"':
            if char == '"' and not escaped:
                closing_chars_stack.pop()
            elif char == '\\':
                escaped = not escaped
            elif char == '\n' and not escaped:
                char = '\\n'
            else:
                escaped = False
        else:
            if char == '"':
                closing_chars_stack.append('"')
            elif char == '{':
                closing_chars_stack.append('}')
            elif char == '[':
                closing_chars_stack.append(']')
            elif char in ['}', ']'] and closing_chars_stack:
                closing_chars_stack.pop()

        completed_string.append(char)

    completed_string.extend(reversed(closing_chars_stack))

    try:
        return json.loads(''.join(completed_string))
    except json.JSONDecodeError:
        return s


class GPTPartialFunctionCall(BaseModel):
    name: str = ""
    arguments_builder: List[str] = []

    @property
    def arguments(self) -> Union[dict, str]:
        self.arguments_builder = [''.join(self.arguments_builder)]
        return _parse_partial_json(self.arguments_builder[0])


class GPTPartialMessage(BaseModel):
    role: Optional[GPTRole] = None
    content_builder: Union[List[str], None] = None
    
    function_call: Optional[GPTPartialFunctionCall] = None
    name: Optional[str] = None

    @property
    def content(self):
        if not self.content_builder:
            return None
    
        self.content_builder = [''.join(self.content_builder)]
        return self.content_builder[0]


class GPTPartialChoice(BaseModel):
    index: int = 0
    message: GPTPartialMessage = GPTPartialMessage()
    role: str = ""
    finnish_reason: str = ""


class GPTPartialResponse(BaseModel):
    id: str = ""
    object: str = ""
    created: int = 0
    model: str = ""
    choices: List[GPTPartialChoice] = []

    def to_final_response(self):
        return GPTResponse(
            id=self.id,
            object=self.object,
            created=self.created,
            model=self.model,
            choices=[GPTChoice(
                index=choice.index,
                message=GPTMessage(
                    role=choice.message.role or "user", # ???
                    content=choice.message.content,
                    function_call=GPTFunctionCall(
                        name=choice.message.function_call.name,
                        arguments=choice.message.function_call.arguments
                    ) if choice.message.function_call else None,
                    name=choice.message.name
                ),
                finnish_reason=choice.finnish_reason
            ) for choice in self.choices]
        )

    def apply_chunk(self, chunk: dict):

        if "id" in chunk:
            self.id = chunk["id"]

        if "error" in chunk:
            raise ValueError(chunk["error"])

        if "object" in chunk:
            self.object = chunk["object"]

        if "created" in chunk:
            self.created = chunk["created"]

        if "model" in chunk:
            self.model = chunk["model"]

        if "choices" in chunk:
            chunk_choices = chunk["choices"]

            for chunk_choice in chunk_choices:
                index = None

                if "index" in chunk_choice:
                    index = int(chunk_choice["index"])

                if index is None:
                    raise ValueError("index not found")

                if index >= len(self.choices):
                    self.choices.append(GPTPartialChoice())

                choice = self.choices[index]
                choice.index = index

                if "finish_reason" in chunk_choice:
                    choice.finnish_reason = chunk_choice["finish_reason"]

                if "role" in chunk_choice:
                    choice.role = chunk_choice["role"]

                message = choice.message

                if "delta" in chunk_choice:
                    chunk_delta = chunk_choice["delta"]

                    if "name" in chunk_delta:
                        message.name = chunk_delta["name"]

                    if "role" in chunk_delta:
                        message.role = chunk_delta["role"]

                    if "content" in chunk_delta and chunk_delta["content"] != None:
                        if message.content_builder is None:
                            message.content_builder = []

                        message.content_builder.append(chunk_delta["content"])

                    if "function_call" in chunk_delta:
                        chunk_function_call = chunk_delta["function_call"]

                        if not message.function_call:
                            message.function_call = GPTPartialFunctionCall()

                        if "name" in chunk_function_call:
                            message.function_call.name = chunk_function_call["name"]

                        if "arguments" in chunk_function_call:
                            message.function_call.arguments_builder.append(chunk_delta["function_call"]["arguments"])
