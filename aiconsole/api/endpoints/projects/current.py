import logging
import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/current")
async def choose_project():
    directory = projects.get_project_directory()
    return JSONResponse({"path": directory, "name": os.path.basename(directory)})

