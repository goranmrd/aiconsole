from pydantic import BaseModel


class BaseIncomingWSMessage(BaseModel):
    pass

class SetChatIdWSMessage(BaseIncomingWSMessage):
    chat_id: str


