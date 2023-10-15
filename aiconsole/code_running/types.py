from pydantic import BaseModel


class CodeToRun(BaseModel):
    language: str
    code: str
