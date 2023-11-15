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
from pathlib import Path
from fastapi import APIRouter
from fastapi.responses import FileResponse

from aiconsole.consts import AICONSOLE_PATH

router = APIRouter()

_log = logging.getLogger(__name__)


@router.get("/image")
async def image(path: str):
    abs_path = Path.cwd() / path

    if abs_path.exists():
        return FileResponse(str(abs_path))

    static_path = AICONSOLE_PATH / "agents" / "core" / "default.jpg"
    return FileResponse(str(static_path))
