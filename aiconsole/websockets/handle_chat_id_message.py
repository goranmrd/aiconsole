from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.incoming_messages import SetChatIdWSMessage


async def handle_chat_id_message(connection: AICConnection, message: SetChatIdWSMessage):
    connection.chat_id = message.chat_id