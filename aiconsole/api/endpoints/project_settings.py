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
    
from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel
from starlette.responses import JSONResponse

from aiconsole.project_settings.settings import Settings

router = APIRouter()


class SettingsPatchData(BaseModel):
    code_autorun: Optional[int] = None


@router.patch("")
async def patch(patch_data: SettingsPatchData):
    settings = Settings()
    settings.patch({settings_name: setting_value for settings_name, setting_value in patch_data if setting_value is not None})
    return JSONResponse({"status": "ok"})


@router.get("")
async def get():
    settings = Settings()
    return JSONResponse(settings.get_settings())

