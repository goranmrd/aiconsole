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

from pathlib import Path

from aiconsole.consts import AICONSOLE_PATH
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.paths import get_core_assets_directory
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()


@router.get("/image")
async def image(path: str):
    abs_path = Path.cwd() / path

    if abs_path.exists():
        return FileResponse(str(abs_path))

    preinstalled_path = AICONSOLE_PATH / "preinstalled" / path

    if preinstalled_path.exists():
        return FileResponse(str(preinstalled_path))

    fallback_image_path = get_core_assets_directory(AssetType.AGENT) / "default.jpg"
    return FileResponse(str(fallback_image_path))
