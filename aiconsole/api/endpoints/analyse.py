import logging

from fastapi import APIRouter
from aiconsole.analysis.AnalysisResponse import AnalysisResponse

from aiconsole.analysis.director import director_analyse
from aiconsole.chat.types import Chat
from aiconsole.websockets.outgoing_messages import ErrorWSMessage

router = APIRouter()
_log = logging.getLogger(__name__)

@router.post("/analyse")
async def director(chat: Chat) -> AnalysisResponse:
    try:
        return await director_analyse(chat)
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send_to_chat(chat.id)
        raise e
