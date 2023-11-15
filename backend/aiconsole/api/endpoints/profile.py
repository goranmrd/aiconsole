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
from aiconsole.core.assets.asset import AssetType
from aiconsole.core.project.paths import get_core_assets_directory, get_project_assets_directory
from aiconsole.core.project.project import is_project_initialized
from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()

log = logging.getLogger(__name__)


@router.get("/profile/{image}")
async def profile_image(image: str):
    if is_project_initialized():
        image_path = get_project_assets_directory(AssetType.AGENT) / image

        if image_path.exists():
            return FileResponse(str(image_path))

    static_path = get_core_assets_directory(AssetType.AGENT) / image
    if static_path.exists():
        return FileResponse(str(static_path))

    default_path = get_core_assets_directory(AssetType.AGENT) / "default.jpg"
    return FileResponse(str(default_path))
