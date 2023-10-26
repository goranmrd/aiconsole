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
from fastapi import APIRouter, status, Response
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.api.endpoints.chats.load_chat_history import load_chat_history
from aiconsole.api.endpoints.chats.save_chat_history import save_chat_history
from aiconsole.chat.types import Chat

router = APIRouter()


@router.delete("/history/{chat_id}")
def delete_history(chat_id: str):
    file_path = os.path.join(projects.get_history_directory(), f"{chat_id}.json")
    if os.path.exists(file_path):
        os.remove(file_path)
        return Response(
            status_code=status.HTTP_200_OK,
            content="Chat history deleted successfully",
        )
    else:
        return Response(
            status_code=status.HTTP_404_NOT_FOUND,
            content="Chat history not found",
        )

@router.get("/history/{chat_id}")
def get_history(chat_id: str):
    chat = load_chat_history(chat_id)

    return JSONResponse(chat.model_dump())


@router.post("/history")
async def save_history(chat: Chat):
    save_chat_history(chat)

    return Response(
        status_code=status.HTTP_201_CREATED,
        content="Chat history saved successfully",
    )


