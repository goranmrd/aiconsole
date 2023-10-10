
from fastapi import APIRouter

from aiconsole.api.endpoints.chats import headlines, history

router = APIRouter()

router.include_router(headlines.router, tags=["image"])
router.include_router(history.router, tags=["analyse"])