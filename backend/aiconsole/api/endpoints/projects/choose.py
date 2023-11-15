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
from pathlib import Path
from typing import Optional
from aiconsole.core.project.paths import get_project_directory
from aiconsole.core.project.project import change_project_directory, is_project_initialized

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

_root = None


async def _ask_directory():
    from tkinter import Tk, filedialog

    global _root

    if not _root:
        _root = Tk()
    else:
        _root.deiconify()
    _root.withdraw()
    initial_dir = get_project_directory() if is_project_initialized() else os.getcwd()
    directory = filedialog.askdirectory(initialdir=initial_dir)

    # Check if the dialog was cancelled (directory is an empty string)
    if directory == "":
        return None
    else:
        return Path(directory)


class ChooseParams(BaseModel):
    directory: Optional[str] = None


@router.post("/is_project")
async def is_project(params: ChooseParams):
    directory = Path(params.directory) if params.directory else None

    if not directory:
        # Show a system select directory dialog
        directory = await _ask_directory()

    if not directory:
        return {"is_project": False, "path": None}

    is_project = directory.joinpath("materials").is_dir() or directory.joinpath("agents").is_dir()

    return {"is_project": is_project, "path": str(directory)}


@router.post("/choose")
async def choose_project(params: ChooseParams):
    directory = Path(params.directory) if params.directory else None

    if directory:
        await change_project_directory(directory)
