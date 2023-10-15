from typing import AsyncGenerator, Callable, List
from pydantic import BaseModel
from aiconsole.chat.types import AICMessage

from aiconsole.gpt.consts import GPTMode
from aiconsole.materials.rendered_material import RenderedMaterial


class AgentBase(BaseModel):
    id: str
    name: str
    usage: str
    system: str
    gpt_mode: GPTMode


class Agent(AgentBase):
    execution_mode: Callable[['ExecutionModeContext'],
                             AsyncGenerator[str, None]]

class ExecutionModeContext(BaseModel):
    messages: List[AICMessage]
    agent: Agent
    gpt_mode: GPTMode
    relevant_materials: List[RenderedMaterial]
