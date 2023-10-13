import logging
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

_log = logging.getLogger(__name__)


@router.get("/image")
async def image(path: str):
    path = Path.cwd() / path

    if path.exists():
        return FileResponse(str(path))

    static_path = Path(__file__).parent / 'aiconsole' / 'agents' / 'core' / 'default.jpg'
    return FileResponse(str(static_path))
