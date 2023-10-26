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
from typing import List, Optional, Union
from unittest.mock import Base
from pydantic import BaseModel
from tomlkit import date
from aiconsole.code_running.code_interpreters.language_map import LanguageStr
from aiconsole.gpt.types import GPTRole


class AICContentMessage(BaseModel):
  id: str
  timestamp: str
  content: str

class AICCodeMessage (AICContentMessage):
  language: LanguageStr
  outputs: List[AICContentMessage]

AICMessage = Union[AICCodeMessage, AICContentMessage]

class AICMessageGroup(BaseModel):
  id: str
  agent_id: str
  role: GPTRole
  task: str
  materials_ids: List[str]
  messages: List[AICMessage]

class Chat(BaseModel):
    id: str
    title: str
    title_edited: bool = False
    last_modified: datetime
    message_groups: List[AICMessageGroup]

    def model_dump(self, **kwargs):
        return {
            **super().model_dump(**kwargs),
            "last_modified": self.last_modified.isoformat(),
        }

class ChatWithAgentAndMaterials(Chat):
    agent_id: str
    relevant_materials_ids: List[str]


class Command(BaseModel):
    command: str


class ChatHeadline(BaseModel):
    id: str
    title: str


class ChatHeadlines(BaseModel):
    headlines: List[ChatHeadline]
