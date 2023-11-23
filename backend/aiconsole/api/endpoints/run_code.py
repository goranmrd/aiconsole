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

import asyncio
import logging
import traceback
from typing import cast

from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from aiconsole.core.assets.materials.material import Material
from aiconsole.core.chat.chat_outgoing_messages import (
    SequenceStage,
    UpdateToolCallOutputWSMessage,
)
from aiconsole.core.code_running.run_code import get_code_interpreter
from aiconsole.core.project import project
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from fastapi import APIRouter, Request

from typing import List
from pydantic import BaseModel


class RunCodeData(BaseModel):
    request_id: str
    tool_call_id: str
    language: str
    code: str
    materials_ids: List[str]


router = APIRouter()

_log = logging.getLogger(__name__)


@router.post("/chats/{chat_id}/run_code")
@cancelable_endpoint
async def run_code(request: Request, data: RunCodeData, chat_id: str):
    try:
        _log.debug("Running code: %s", data.code)

        await UpdateToolCallOutputWSMessage(
            request_id=data.request_id, stage=SequenceStage.START, id=data.tool_call_id
        ).send_to_chat(chat_id)

        mats = [project.get_project_materials().get_asset(mid) for mid in data.materials_ids]
        mats = [cast(Material, mat) for mat in mats if mat is not None]

        # If the code starts with a !, that means a shell command
        if data.language == "python" and data.code.startswith("!"):
            data.language = "shell"
            data.code = data.code[1:]

        try:
            async for token in get_code_interpreter(data.language).run(data.code, chat_id, data.tool_call_id, mats):
                await UpdateToolCallOutputWSMessage(
                    request_id=data.request_id,
                    stage=SequenceStage.MIDDLE,
                    id=data.tool_call_id,
                    output_delta=token,
                ).send_to_chat(chat_id)
        except asyncio.CancelledError:
            get_code_interpreter(data.language).terminate()
            _log.info("Run cancelled")
        except Exception:
            await ErrorWSMessage(error=traceback.format_exc().strip()).send_to_chat(chat_id)
            await UpdateToolCallOutputWSMessage(
                request_id=data.request_id,
                stage=SequenceStage.MIDDLE,
                id=data.tool_call_id,
                output_delta=traceback.format_exc().strip(),
            ).send_to_chat(chat_id)
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send_to_chat(chat_id)
        raise e
    finally:
        await UpdateToolCallOutputWSMessage(
            request_id=data.request_id, stage=SequenceStage.END, id=data.tool_call_id
        ).send_to_chat(chat_id)
