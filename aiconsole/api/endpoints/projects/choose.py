import logging
import os
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.websockets.messages import ProjectOpenedWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

@router.post("/choose")
async def choose_project():
    # Show a system select directory dialog

    import tkinter as tk
    from tkinter import filedialog

    root = tk.Tk()
    root.withdraw()  # Hide the main window

    directory = filedialog.askdirectory(initialdir=projects.get_project_directory())  # Show the "select directory" dialog

    await projects.change_project_directory(directory)

    return JSONResponse({})

