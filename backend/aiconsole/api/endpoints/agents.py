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
from aiconsole.core.project import project
from aiconsole.core.agents.types import AgentBase
from aiconsole.core.gpt.consts import GPTMode

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/agents")
async def agents_handler():
    all_agents = project.get_project_agents().all_agents()

    all_agents = [
        AgentBase(id= "user", name= "User", gpt_mode=GPTMode.QUALITY, usage= "", system= ""),
        *[agent for agent in all_agents]
    ]

    return JSONResponse([AgentBase(
        id=agent.id,
        name=agent.name,
        gpt_mode=agent.gpt_mode,
        usage=agent.usage,
        system=agent.system,
    ).model_dump() for agent in all_agents])