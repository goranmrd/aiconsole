from typing import List
from pydantic import BaseModel


class CodeToRun(BaseModel):
    language: str
    code: str
    materials_ids: List[str]
