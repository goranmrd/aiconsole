from typing import List, Optional
from typing_extensions import TypedDict


class AgentDict(TypedDict):
    id: str
    name: str
    usage: str
    system: str
    execution_mode: str


class MaterialDict(TypedDict):
    id: str
    usage: str
    content: str


class AnalysisResponse(TypedDict):
    next_step: str
    agent: Optional[AgentDict]
    materials: List[MaterialDict]
