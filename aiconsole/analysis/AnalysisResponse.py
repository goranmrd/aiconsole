from typing import List, Optional
from typing_extensions import TypedDict


class AnalysisResponse(TypedDict):
    next_step: str
    agent_id: Optional[str]
    materials_ids: List[str]
