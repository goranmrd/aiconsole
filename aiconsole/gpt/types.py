from typing import List, Literal, Optional
from pydantic import BaseModel
from typing_extensions import TypedDict


CLEAR_STR = "<<<< CLEAR >>>>"
CLEAR_STR_TYPE = Literal["<<<< CLEAR >>>>"]


GPTRole = Literal["user", "assistant", "system", "function"]


class EnforcedFunctionCall(TypedDict):
    name: str


class GPTFunctionCall(BaseModel):
    name: str
    arguments: str


class GPTMessage(BaseModel):
    role: GPTRole
    content: Optional[str]
    function_call: Optional[GPTFunctionCall] = None
    name: Optional[str] = None

    def model_dump(self):
        # Don't include None values, call to super to avoid recursion
        return {k: v for k, v in super().model_dump().items() if v is not None}


class GPTChoice(BaseModel):
    index: int
    message: GPTMessage
    finnish_reason: str


class GPTResponse(BaseModel):
    id: str = ""
    object: str = ""
    created: int = 0
    model: str = ""
    choices: List[GPTChoice]

