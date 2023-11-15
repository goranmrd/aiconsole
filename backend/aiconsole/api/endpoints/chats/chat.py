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

from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.paths import get_core_assets_directory, get_history_directory
from fastapi import APIRouter, status, Response
from fastapi.responses import JSONResponse
from aiconsole.core.chat.types import Chat
from aiconsole.core.chats.load_chat_history import load_chat_history
from aiconsole.core.chats.save_chat_history import save_chat_history
from send2trash import send2trash

router = APIRouter()


@router.delete("/{chat_id}")
async def delete_history(chat_id: str):
    file_path = get_history_directory() / f"{chat_id}.json"
    if file_path.exists():
        send2trash(file_path)
        return Response(
            status_code=status.HTTP_200_OK,
            content="Chat history deleted successfully",
        )
    else:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content="Chat history not found",
        )


@router.get("/{chat_id}")
async def get_history(chat_id: str):
    chat = await load_chat_history(chat_id)

    return JSONResponse(chat.model_dump())


@router.patch("/{chat_id}")
async def save_history(chat_id, chat: Chat):
    if chat_id != chat.id:
        return Response(
            status_code=status.HTTP_400_BAD_REQUEST,
            content="Chat ID mismatch",
        )

    save_chat_history(chat)

    return Response(
        status_code=status.HTTP_201_CREATED,
        content="Chat history saved successfully",
    )
