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

import logging
from aiconsole.core.chat.types import ChatHeadline
from aiconsole.api.endpoints.chats.chat import router
from aiconsole.core.chats.list_possible_historic_chat_ids import list_possible_historic_chat_ids
from aiconsole.core.chats.load_chat_history import load_chat_history
from aiconsole.core.chats.save_chat_history import save_chat_history

_log = logging.getLogger(__name__)


@router.get("/")
async def get_history_headlines():
    headlines = []

    for chat_id in list_possible_historic_chat_ids():
        try:
            chat = await load_chat_history(chat_id)

            if chat:
                headlines.append(
                    ChatHeadline(id=chat_id, name=chat.name, last_modified=chat.last_modified).model_dump()
                )

        except Exception as e:
            _log.exception(e)
            _log.error(f"Failed to get history: {e} {chat_id}")

    return headlines
