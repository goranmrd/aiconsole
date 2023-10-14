import logging
import os
import tkinter
from tkinter import Tk, filedialog
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.websockets.messages import ProjectOpenedWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

root = None

def ask_directory():
    global root

    if not root:
        root = Tk()
    else:
        root.deiconify()
    directory = filedialog.askdirectory(initialdir=projects.get_project_directory())
    root.withdraw()

    return directory

@router.post("/choose")
async def choose_project():
    # Show a system select directory dialog

    directory = ask_directory()

    if directory:
        await projects.change_project_directory(directory)

    return JSONResponse({})

