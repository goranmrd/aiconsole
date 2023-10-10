import traceback
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from aiconsole.aic_types import CodeToRun
from aiconsole.code_interpreters.get_code_interpreter import get_code_interpreter
import logging
from aiconsole.websockets.messages import ErrorWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

@router.post("/chats/{chat_id}/run_code")
async def run_code(chat_id: str, codeToRun: CodeToRun) -> StreamingResponse:
    async def async_wrapper():
        try:
            _log.debug("Running code: %s", codeToRun.code)

            try:
                for chunk in get_code_interpreter(codeToRun.language).run(codeToRun.code):
                    yield chunk
            except:
                await ErrorWSMessage(error=traceback.format_exc().strip()).send(chat_id)
                yield traceback.format_exc().strip()
        except Exception as e:
            await ErrorWSMessage(error=str(e)).send(chat_id)
            raise e

    return StreamingResponse(
        async_wrapper(), media_type="text/event-stream"
    )
    
