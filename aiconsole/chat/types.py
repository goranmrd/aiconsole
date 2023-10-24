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
from aiconsole.gpt.types import GPTRole


class AICMessage(BaseModel):
    id: str
    agent_id: str
    role: GPTRole
    task: Optional[str] = None
    content: str
    timestamp: str
    materials_ids: List[str]

    language: Optional[str] = None
    code: Optional[bool] = False
    code_ran: Optional[bool] = False
    code_output: Optional[bool] = False


class Chat(BaseModel):
    id: str

    messages: List[AICMessage]


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
