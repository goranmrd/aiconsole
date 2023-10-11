from pydantic import BaseModel
from typing import Optional, Any
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from aiconsole.websockets import connection_manager

router = APIRouter()

_log = logging.getLogger(__name__)

class IncomingMessage(BaseModel):
    type: str
    detail: Any
    error: Optional[str]

@router.websocket("/ws/{chat_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await connection_manager.connect(websocket, chat_id)

    try: 
        while True:
            json_data = await websocket.receive_text()
            message = IncomingMessage.model_validate_json(json_data)
            # Handle the message accordingly
            # For example, when there is an error:
            if message.error:
                pass
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
