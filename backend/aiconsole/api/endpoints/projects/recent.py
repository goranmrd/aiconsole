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

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole.recent_projects import recent_projects
from pydantic import BaseModel

class _DeleteProjectPayload(BaseModel):
    path: str

router = APIRouter()

@router.get("/recent")
async def choose_project():
    return JSONResponse(await recent_projects.get_recent_project())

@router.delete("/recent")
async def delete_project(data: _DeleteProjectPayload):
    await recent_projects.remove_from_recent_projects(data.path)
