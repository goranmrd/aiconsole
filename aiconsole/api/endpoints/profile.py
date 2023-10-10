from importlib import resources
import logging
import os
from fastapi import APIRouter
from fastapi.responses import FileResponse

from aiconsole.settings import AGENTS_CORE_RESOURCE, AGENTS_DIRECTORY

router = APIRouter()

log = logging.getLogger(__name__)

@router.get("/profile/{image}")
async def profile_image(image: str):
    if os.path.exists(os.path.join(AGENTS_DIRECTORY, image)):
        return FileResponse(os.path.join(AGENTS_DIRECTORY, image))
    
    with resources.path(AGENTS_CORE_RESOURCE, image) as static_path:
        if os.path.exists(str(static_path)):
            return FileResponse(str(static_path))
    
    with resources.path(AGENTS_CORE_RESOURCE, 'default.jpg') as static_path:
        return FileResponse(static_path)


