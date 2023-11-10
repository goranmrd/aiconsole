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
from fastapi import Request
from aiconsole.api.endpoints.chats.history import router
from aiconsole.core.chats.list_possible_historic_chat_ids import list_possible_historic_chat_ids
from aiconsole.core.chats.load_chat_history import load_chat_history
from aiconsole.core.chats.save_chat_history import save_chat_history

_log = logging.getLogger(__name__)

@router.get("/headlines")
async def get_history_headlines():
    headlines = []

    for chat_id in list_possible_historic_chat_ids():
        try:
            chat = await load_chat_history(chat_id)

            if chat:
                headlines.append({
                    "message": chat.title,
                    "id": chat_id,
                    "timestamp": chat.last_modified.isoformat()
                })

        except Exception as e:
            _log.exception(e)
            _log.error(f"Failed to get history: {e} {chat_id}")

    return headlines


@router.post("/headlines/{chat_id}")
async def update_chat_headline(chat_id, req: Request):
    data = await req.json()
    new_headline = data["headline"]

    chat = await load_chat_history(chat_id)
    chat.title = new_headline
    chat.title_edited = True
    save_chat_history(chat)

    return new_headline
