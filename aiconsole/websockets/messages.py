from typing import Literal
from pydantic import BaseModel

class BaseWSMessage(BaseModel):
    type: str

    def send(self, chat_id: str):
        from aiconsole.websockets.connection_manager import send_message
        return send_message(chat_id, self)
    
    def send_to_all(self):
        from aiconsole.websockets.connection_manager import send_message_to_all
        return send_message_to_all(self)

class NotificationWSMessage(BaseWSMessage):
    type: Literal["notification"] = "notification"
    title: str
    message: str

class ErrorWSMessage(BaseWSMessage):
    type: Literal["error"] = "error"
    error: str