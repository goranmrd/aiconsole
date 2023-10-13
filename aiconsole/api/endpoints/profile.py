import logging
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse

from aiconsole.settings import settings

router = APIRouter()

log = logging.getLogger(__name__)


@router.get("/profile/{image}")
async def profile_image(image: str):
    image_path = Path(settings.AGENTS_DIRECTORY) / image

    if image_path.exists():
        return FileResponse(str(image_path))

    static_path = Path(settings.AGENTS_CORE_RESOURCE) / image
    if static_path.exists():
        return FileResponse(str(static_path))

    default_path = Path(settings.AGENTS_CORE_RESOURCE) / 'default.jpg'
    return FileResponse(str(default_path))
