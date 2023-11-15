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
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import logging
from aiconsole.core.project import project
from aiconsole.core.code_running.run_code import get_code_interpreter
from aiconsole.core.code_running.types import CodeToRun
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)


@router.post("/chats/{chat_id}/run_code")
@cancelable_endpoint
async def run_code(request: Request, code_to_run: CodeToRun, chat_id: str) -> StreamingResponse:
    async def async_wrapper():
        try:
            _log.debug("Running code: %s", code_to_run.code)

            mats = [project.get_project_materials().get_asset(mid) for mid in code_to_run.materials_ids]

            # If the code starts with a !, that means a shell command
            if code_to_run.language == "python" and code_to_run.code.startswith("!"):
                code_to_run.language = "shell"
                code_to_run.code = code_to_run.code[1:]

            try:
                for chunk in get_code_interpreter(code_to_run.language).run(code_to_run.code, mats):
                    yield chunk
            except asyncio.CancelledError:
                get_code_interpreter(code_to_run.language).terminate()
                _log.info("Run cancelled")
            except Exception:
                await ErrorWSMessage(error=traceback.format_exc().strip()).send_to_chat(chat_id)
                yield traceback.format_exc().strip()
        except Exception as e:
            await ErrorWSMessage(error=str(e)).send_to_chat(chat_id)
            raise e

    return StreamingResponse(async_wrapper(), media_type="text/event-stream")
