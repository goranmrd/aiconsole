from typing import List, Optional

from pydantic import BaseModel

from aiconsole.gpt.types import GPTRole
from typing import AsyncGenerator, Callable, List
from aiconsole.gpt.consts import GPTMode


###################################################################################################
# Materials
###################################################################################################

class BaseMaterial(BaseModel):
    id: str
    usage: str


class Material(BaseMaterial):
    content: Callable[['ContentEvaluationContext'], str]


class StaticMaterial(BaseMaterial):
    content: str

###################################################################################################
# Agents
###################################################################################################

class AgentBase(BaseModel):
    id: str
    name: str
    usage: str
    system: str
    gpt_mode: GPTMode


class Agent(AgentBase):
    execution_mode: Callable[['ExecutionModeContext'], AsyncGenerator[str, None]]


###################################################################################################
# Chats and messages
###################################################################################################

class AICMessage(BaseModel):
    id: str
    agent_id: str
    role: GPTRole
    task: Optional[str] = None
    content: str
    timestamp: str
    materials: List[StaticMaterial]

    language: Optional[str] = None
    code: Optional[bool] = False
    code_output: Optional[bool] = False


class Chat(BaseModel):
    id: str
    messages: List[AICMessage]


class ChatWithAgentAndMaterials(Chat):
    agent_id: str
    relevant_materials: List[StaticMaterial]

class Command(BaseModel):
    command: str


class ChatHeadline(BaseModel):
    id: str
    title: str


class ChatHeadlines(BaseModel):
    headlines: List[ChatHeadline]


###################################################################################################
# Task contexts
###################################################################################################

class ContentEvaluationContext(BaseModel):
    messages: List[AICMessage]
    agent: Agent
    gpt_mode: GPTMode
    relevant_materials: List["Material"]


class ExecutionModeContext(BaseModel):
    messages: List[AICMessage]
    agent: Agent
    gpt_mode: GPTMode
    relevant_materials: List["StaticMaterial"]


class CodeToRun(BaseModel):
    language: str
    code: str







