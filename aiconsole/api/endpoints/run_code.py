import traceback
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import logging
from aiconsole import projects
from aiconsole.code_running.run_code import get_code_interpreter
from aiconsole.code_running.types import CodeToRun
from aiconsole.websockets.outgoing_messages import ErrorWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

@router.post("/chats/{chat_id}/run_code")
async def run_code(chat_id: str, codeToRun: CodeToRun) -> StreamingResponse:
    async def async_wrapper():
        try:
            _log.debug("Running code: %s", codeToRun.code)

            mats = [projects.get_project_materials().get_material(mid) for mid in codeToRun.materials_ids]

            try:
                for chunk in get_code_interpreter(codeToRun.language).run(codeToRun.code, mats):
                    yield chunk
            except Exception:
                await ErrorWSMessage(error=traceback.format_exc().strip()).send_to_chat(chat_id)
                yield traceback.format_exc().strip()
        except Exception as e:
            await ErrorWSMessage(error=str(e)).send_to_chat(chat_id)
            raise e

    return StreamingResponse(
        async_wrapper(), media_type="text/event-stream"
    )
    
