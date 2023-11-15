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
from aiconsole.core.recent_projects.recent_projects import get_recent_project, remove_from_recent_projects
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class _DeleteProjectPayload(BaseModel):
    path: Path


router = APIRouter()


@router.get("/recent")
async def choose_project():
    return JSONResponse([rp.model_dump() for rp in await get_recent_project()])


@router.delete("/recent")
async def delete_project(data: _DeleteProjectPayload):
    await remove_from_recent_projects(data.path)
