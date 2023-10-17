import logging
import easygui
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects

router = APIRouter()

_log = logging.getLogger(__name__)


def ask_directory():
    directory = easygui.diropenbox(default=projects.get_project_directory())
    return directory


@router.post("/choose")
async def choose_project():
    # Show a system select directory dialog
    directory = ask_directory()

    if directory:
        await projects.change_project_directory(directory)

    return JSONResponse({})
