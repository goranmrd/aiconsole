from aiconsole.agents.types import Agent
from aiconsole.chat.types import AICMessage
from aiconsole.gpt.consts import GPTMode
from aiconsole.materials.material import Material


from pydantic import BaseModel


from typing import List


class ContentEvaluationContext(BaseModel):
    messages: List[AICMessage]
    agent: Agent
    gpt_mode: GPTMode
    relevant_materials: List["Material"]