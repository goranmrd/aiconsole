import logging
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse
from aiconsole import projects
from aiconsole.agents import agents

from aiconsole.settings import settings

router = APIRouter()

log = logging.getLogger(__name__)


@router.get("/profile/{image}")
async def profile_image(image: str):
    if not agents.agents:
        raise ValueError("Agents not initialized")

    image_path = agents.agents.user_directory / image

    if image_path.exists():
        return FileResponse(str(image_path))

    static_path = Path(agents.agents.core_resource) / image
    if static_path.exists():
        return FileResponse(str(static_path))

    default_path = Path(agents.agents.core_resource) / 'default.jpg'
    return FileResponse(str(default_path))
