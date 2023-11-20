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

from typing import List, Literal, Union
from pydantic import BaseModel
from typing_extensions import TypedDict


CLEAR_STR = "<<<< CLEAR >>>>"
CLEAR_STR_TYPE = Literal["<<<< CLEAR >>>>"]


GPTRole = Literal["user", "assistant", "system", "tool"]


class EnforcedFunctionCallFuncSpec(TypedDict):
    name: str


class EnforcedFunctionCall(TypedDict):
    type: Literal["function"]
    function: EnforcedFunctionCallFuncSpec


class GPTFunctionCall(BaseModel):
    name: str
    arguments: Union[dict, str]


class GPTToolCall(BaseModel):
    id: str
    type: str = "function"
    function: GPTFunctionCall


class GPTResponseMessage(BaseModel):
    role: GPTRole
    content: str | None = None
    tool_calls: list[GPTToolCall] = []
    name: str | None = None

    def model_dump(self):
        # Don't include None values, call to super to avoid recursion
        return {k: v for k, v in super().model_dump().items() if v is not None}


class GPTRequestToolMessage(BaseModel):
    role: GPTRole = "tool"
    content: str | None
    tool_call_id: str


class GPTRequestTextMessage(BaseModel):
    role: GPTRole
    content: str | None = None
    name: str | None = None
    tool_calls: List[GPTToolCall] | None = None

    def model_dump(self):
        # Don't include None values, call to super to avoid recursion
        return {k: v for k, v in super().model_dump().items() if v is not None}


GPTRequestMessage = Union[GPTRequestTextMessage, GPTRequestToolMessage]


class GPTChoice(BaseModel):
    index: int
    message: GPTResponseMessage
    finnish_reason: str


class GPTResponse(BaseModel):
    id: str = ""
    object: str = ""
    created: int = 0
    model: str = ""
    choices: List[GPTChoice]
