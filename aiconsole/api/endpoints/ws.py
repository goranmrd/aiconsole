import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from aiconsole import projects

from aiconsole.websockets import connection_manager
from aiconsole.websockets.handle_incoming_message import handle_incoming_message

router = APIRouter()

_log = logging.getLogger(__name__)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    connection = await connection_manager.connect(websocket)
    await projects.send_project_init(connection)

    try:
        while True:
            json_data = await websocket.receive_json()
            await handle_incoming_message(connection, json_data)
    except WebSocketDisconnect:
        connection_manager.disconnect(connection)
