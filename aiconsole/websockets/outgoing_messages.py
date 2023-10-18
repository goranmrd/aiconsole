from typing import List, Optional
from pydantic import BaseModel

class BaseWSMessage(BaseModel):
    def get_type(self):
        return self.__class__.__name__

    def send_to_chat(self, chat_id: str):
        from aiconsole.websockets.connection_manager import send_message_to_chat
        return send_message_to_chat(chat_id, self)
    
    def send_to_all(self):
        from aiconsole.websockets.connection_manager import send_message_to_all
        return send_message_to_all(self)
    
    def model_dump(self):
        # Don't include None values, call to super to avoid recursion
        return {k: v for k, v in super().model_dump().items() if v is not None}

class NotificationWSMessage(BaseWSMessage):
    title: str
    message: str

class DebugJSONWSMessage(BaseWSMessage):
    message: str
    object: dict

class ErrorWSMessage(BaseWSMessage):
    error: str

class ProjectOpenedWSMessage(BaseWSMessage):
    name: str
    path: str

class AnalysisUpdatedWSMessage(BaseWSMessage):
    agent_id: Optional[str] = None
    relevant_material_ids: Optional[List[str]] = None
    next_step: Optional[str] = None
    thinking_process: Optional[str] = None