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


async def _send(socket: WebSocket, msg: BaseWSMessage):
    await socket.send_json({
        "type": msg.get_type(),
        **msg.model_dump()
    })

async def send_message(chat_id: str, msg: BaseWSMessage):
    _log.info(f"Sending message to {chat_id}: {msg}")
    for connection in _active_connections[chat_id]:
        await _send(connection, msg)


async def send_message_to_all(msg: BaseWSMessage):
    _log.info(f"Sending message to all: {msg}")
    for connections in _active_connections.values():
        for connection in connections:
            await _send(connection, msg)


async def send_message_to_one(websocket: WebSocket, msg: BaseWSMessage):
    _log.info(f"Sending message to one: {msg}")
    await _send(websocket, msg)
