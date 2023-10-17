from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.handle_chat_id_message import handle_chat_id_message
from aiconsole.websockets.incoming_messages import SetChatIdWSMessage


async def handle_incoming_message(connection: AICConnection, json: dict):
    message_type = json["type"]

    if message_type == SetChatIdWSMessage.__name__:
        await handle_chat_id_message(connection, SetChatIdWSMessage(**json))
    else:
        raise Exception(f"Unknown message type: {message_type}")