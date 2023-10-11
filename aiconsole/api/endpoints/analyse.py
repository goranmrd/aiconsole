import logging

from fastapi import APIRouter
from aiconsole.aic_types import Chat
from aiconsole.analysis.AnalysisResponse import AnalysisResponse

from aiconsole.analysis.director import director_analyse
from aiconsole.websockets.messages import ErrorWSMessage

router = APIRouter()
_log = logging.getLogger(__name__)

@router.post("/analyse")
async def director(chat: Chat) -> AnalysisResponse:
    try:
        return await director_analyse(chat)
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send(chat.id)
        raise e
