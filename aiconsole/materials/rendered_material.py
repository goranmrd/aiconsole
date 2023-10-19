from pydantic import BaseModel


class RenderedMaterial(BaseModel):
    id: str
    content: str
