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

import os
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from aiconsole import projects

router = APIRouter()

_root = None

def _ask_directory():
    from tkinter import Tk, filedialog

    global _root

    if not _root:
        _root = Tk()
    else:
        _root.deiconify()
    _root.withdraw()
    initial_dir = projects.get_project_directory() if projects.is_project_initialized() else os.getcwd()
    directory = filedialog.askdirectory(initialdir=initial_dir)

    return directory


class ChooseParams(BaseModel):
    directory: Optional[str] = None

@router.post("/choose")
async def choose_project(params: ChooseParams):
    directory = params.directory
    
    if not directory:
        # Show a system select directory dialog
        directory = _ask_directory()

    if directory:
        await projects.change_project_directory(directory)
