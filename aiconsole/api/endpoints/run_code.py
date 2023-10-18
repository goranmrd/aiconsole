import asyncio
import traceback
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import logging
from aiconsole import projects
from aiconsole.code_running.run_code import get_code_interpreter
from aiconsole.code_running.types import CodeToRun
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from aiconsole.websockets.outgoing_messages import ErrorWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

@router.post("/chats/{chat_id}/run_code")
@cancelable_endpoint
async def run_code(request: Request, code_to_run: CodeToRun, chat_id: str) -> StreamingResponse:
    async def async_wrapper():
        try:
            _log.debug("Running code: %s", code_to_run.code)

            mats = [projects.get_project_materials().get_material(mid) for mid in code_to_run.materials_ids]

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

    return StreamingResponse(
        async_wrapper(), media_type="text/event-stream"
    )
    
