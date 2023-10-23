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
