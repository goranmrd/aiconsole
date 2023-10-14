import logging
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse

from aiconsole.settings import AICONSOLE_PATH

router = APIRouter()

_log = logging.getLogger(__name__)


@router.get("/image")
async def image(path: str):
    abs_path = Path.cwd() / path

    if abs_path.exists():
        return FileResponse(str(abs_path))

    static_path = AICONSOLE_PATH / 'agents' / 'core' / 'default.jpg'
    return FileResponse(str(static_path))
