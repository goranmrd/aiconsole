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

router = APIRouter()

_log = logging.getLogger(__name__)


@router.get("/")
async def materials_get():
    return JSONResponse(
        [
            {
                "id": material.id,
                "name": material.name,
                "defined_in": material.defined_in,
                "status": material.status,
                "usage": material.usage
            } for material in projects.get_project_materials().all_materials()
        ]
    )
