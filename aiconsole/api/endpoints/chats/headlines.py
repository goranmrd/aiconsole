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

import os
from fastapi import Request
from aiconsole import projects
from aiconsole.api.endpoints.chats.save_chat_history import save_chat_history
from aiconsole.api.endpoints.chats.load_chat_history import load_chat_history
from aiconsole.api.endpoints.chats.history import router
import logging

_log = logging.getLogger(__name__)

def list_possible_historic_chat_ids():
    history_directory = projects.get_history_directory()
    if os.path.exists(history_directory) and os.path.isdir(history_directory):
        entries = os.scandir(history_directory)

        files = [entry for entry in entries if entry.is_file()
                 and entry.name.endswith(".json")]
        # Sort the files based on modification time (descending order)
        files = sorted(files, key=lambda entry: os.path.getmtime(
            entry.path), reverse=True)

        return [file.name.split(".")[0] for file in files]
    else:
        return []


@router.get("/headlines")
def get_history_headlines():
    headlines = []

    for chat_id in list_possible_historic_chat_ids():
        try:
            chat = load_chat_history(chat_id)

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

    chat = load_chat_history(chat_id)
    chat.title = new_headline
    save_chat_history(chat)

    return new_headline