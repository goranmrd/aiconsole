from importlib import resources
import logging
import os
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

log = logging.getLogger(__name__)

@router.get("/image")
async def image(path: str):
    path = os.path.join(os.getcwd(), path)

    if os.path.exists(path):
        return FileResponse(path)
    else:
        with resources.path('aiconsole.agents.core', 'default.jpg') as static_path:
            return FileResponse(static_path)