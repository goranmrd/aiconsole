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

from aiconsole.api.endpoints import run_code
from aiconsole.api.endpoints import projects
from fastapi import APIRouter

from aiconsole.api.endpoints import (
    chats,
    commands_history,
    profile,
    image,
    agents,
    ping,
    ws,
    materials,
    project_settings,
    check_key,
)


app_router = APIRouter()

app_router.include_router(ping.router)
app_router.include_router(image.router)
app_router.include_router(check_key.router)
app_router.include_router(run_code.router)
app_router.include_router(profile.router)
app_router.include_router(chats.router, prefix="/api/chats")
app_router.include_router(materials.router, prefix="/api/materials")
app_router.include_router(agents.router, prefix="/api/agents")
app_router.include_router(projects.router, prefix="/api/projects")
app_router.include_router(project_settings.router, prefix="/api/settings")
app_router.include_router(commands_history.router)
app_router.include_router(ws.router)
