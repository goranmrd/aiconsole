from pydantic import BaseModel

class BaseWSMessage(BaseModel):
    def get_type(self):
        return self.__class__.__name__

    def send(self, chat_id: str):
        from aiconsole.websockets.connection_manager import send_message
        return send_message(chat_id, self)
    
    def send_to_all(self):
        from aiconsole.websockets.connection_manager import send_message_to_all
        return send_message_to_all(self)
    
    def send_to_one(self, websocket):
        from aiconsole.websockets.connection_manager import send_message_to_one
        return send_message_to_one(websocket, self)

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