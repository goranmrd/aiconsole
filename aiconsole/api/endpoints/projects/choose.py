# The AIConsole Project
# 
# Copyright 2023 10Clouds
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
    
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
    root.withdraw()
    directory = filedialog.askdirectory(initialdir=projects.get_project_directory())
    
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
