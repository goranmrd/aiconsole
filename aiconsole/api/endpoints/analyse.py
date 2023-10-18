import asyncio
import logging

from fastapi import APIRouter, Request

from aiconsole.analysis.director import director_analyse
from aiconsole.chat.types import Chat
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from aiconsole.websockets.outgoing_messages import ErrorWSMessage

router = APIRouter()
_log = logging.getLogger(__name__)

@router.post("/analyse")
@cancelable_endpoint
async def analyse(request: Request, chat: Chat):
    try:
        return await director_analyse(chat)
    except asyncio.CancelledError:
        _log.info("Analysis cancelled")
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send_to_chat(chat.id)
        raise e
