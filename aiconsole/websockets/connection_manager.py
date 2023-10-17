"""

Connection manager for websockets. Keeps track of all active connections

"""

import logging
from fastapi import WebSocket
from typing import List
from aiconsole.websockets.outgoing_messages import BaseWSMessage

_log = logging.getLogger(__name__)
_active_connections: List['AICConnection'] = []


class AICConnection:
    _websocket: WebSocket
    chat_id: str = ""

    def __init__(self, websocket: WebSocket):
        self._websocket = websocket

    async def send(self, msg: BaseWSMessage):
        await self._websocket.send_json({
            "type": msg.get_type(),
            **msg.model_dump()
        })


async def connect(websocket: WebSocket):
    await websocket.accept()
    connection = AICConnection(websocket)
    _active_connections.append(connection)
    _log.info("Connected")
    return connection


def disconnect(connection: AICConnection):
    _active_connections.remove(connection)
    _log.info("Disconnected")


async def send_message_to_chat(chat_id: str, msg: BaseWSMessage):
    # _log.debug(f"Sending message to {chat_id}: {msg}")
    for connection in _active_connections:
        if connection.chat_id == chat_id:
            await connection.send(msg)


async def send_message_to_all(msg: BaseWSMessage):
    # _log.debug(f"Sending message to all: {msg}")
    for connection in _active_connections:
        await connection.send(msg)
