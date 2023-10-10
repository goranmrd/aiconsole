"""

Connection manager for websockets. Keeps track of all active connections

"""

import logging
from fastapi import WebSocket
from typing import Dict, List
from collections import defaultdict

from aiconsole.websockets.messages import BaseWSMessage


_log = logging.getLogger(__name__)
_active_connections: Dict[str, List[WebSocket]] = defaultdict(list)

async def connect(websocket: WebSocket, chat_id: str):
    await websocket.accept()
    _log.info(f"Connected to chat {chat_id}")
    
    _active_connections[chat_id].append(websocket)

def disconnect(websocket: WebSocket):
    for chat_id, connections in _active_connections.items():
        if websocket in connections:
            connections.remove(websocket)
            _log.info(f"Disconnected from chat {chat_id}")
            break

async def send_message(chat_id: str, msg: BaseWSMessage):
    _log.info(f"Sending message to {chat_id}: {msg}")
    for connection in _active_connections[chat_id]:
        await connection.send_text(msg.model_dump_json())

async def send_message_to_all(msg: BaseWSMessage):
    _log.info(f"Sending message to all: {msg}")
    for connections in _active_connections.values():
        for connection in connections:
            await connection.send_text(msg.model_dump_json())
