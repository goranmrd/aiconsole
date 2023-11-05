from pydantic import BaseModel


class RecentProject(BaseModel):
    name: str
    path: str
    recent_chats: list[str]