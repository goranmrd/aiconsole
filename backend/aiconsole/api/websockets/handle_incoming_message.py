# The AIConsole Project
#
# Copyright 2023 10Clouds
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from aiconsole.api.websockets.connection_manager import AICConnection
from aiconsole.api.websockets.handle_chat_id_message import handle_chat_id_message
from aiconsole.api.websockets.incoming_messages import SetChatIdWSMessage


async def handle_incoming_message(connection: AICConnection, json: dict):
    message_type = json["type"]

    if message_type == SetChatIdWSMessage.__name__:
        await handle_chat_id_message(connection, SetChatIdWSMessage(**json))
    else:
        raise Exception(f"Unknown message type: {message_type}")
