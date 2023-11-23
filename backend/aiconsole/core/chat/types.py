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

from datetime import datetime
from typing import List, Union
from aiconsole.core.assets.asset import EditableObject

from aiconsole.core.code_running.code_interpreters.language_map import LanguageStr
from aiconsole.core.gpt.types import GPTRole
from pydantic import BaseModel


class AICToolCall(BaseModel):
    id: str
    language: LanguageStr
    code: str
    headline: str
    output: str | None = None


class AICMessage(BaseModel):
    id: str
    timestamp: str
    content: str
    tool_calls: list[AICToolCall]


class AICMessageGroup(BaseModel):
    id: str
    agent_id: str
    role: GPTRole
    task: str
    materials_ids: List[str]
    messages: List[AICMessage]


class ChatHeadline(EditableObject):
    last_modified: datetime

    def model_dump(self, **kwargs):
        return {
            **super().model_dump(**kwargs),
            "last_modified": self.last_modified.isoformat(),
        }


class Chat(ChatHeadline):
    title_edited: bool = False
    message_groups: List[AICMessageGroup]


class Command(BaseModel):
    command: str


class ChatHeadlines(BaseModel):
    headlines: List[ChatHeadline]
