import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.websockets.outgoing_messages import NotificationWSMessage

router = APIRouter()

_log = logging.getLogger(__name__)

root = None

def ask_directory():
    from tkinter import Tk, filedialog
    
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
    try:
        directory = ask_directory()

        if directory:
            await projects.change_project_directory(directory)
    except Exception as e:
        await NotificationWSMessage(title="Error", message=e.__str__()).send_to_all()

    return JSONResponse({})
