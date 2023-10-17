from aiconsole.websockets.connection_manager import AICConnection
from aiconsole.websockets.incoming_messages import SetChatIdWSMessage
from aiconsole.websockets.outgoing_messages import NotificationWSMessage


async def handle_chat_id_message(connection: AICConnection, message: SetChatIdWSMessage):
    connection.chat_id = message.chat_id
    await connection.send(NotificationWSMessage(
        title="Chat ID Set",
        message=f"Chat ID set to {message.chat_id}"
    ))