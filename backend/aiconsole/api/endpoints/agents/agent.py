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

from aiconsole.api.utils.asset_exists import asset_exists
from aiconsole.api.utils.asset_get import asset_get
from aiconsole.api.utils.asset_save import asset_patch, asset_post
from aiconsole.api.utils.asset_status_change import asset_status_change
from aiconsole.api.utils.status_change_post_body import StatusChangePostBody
from aiconsole.core.assets.agents.agent import Agent, AgentWithStatus
from aiconsole.core.assets.asset import AssetLocation, AssetStatus, AssetType
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.project import project
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/{agent_id}")
async def agent_get(request: Request, agent_id: str):
    return await asset_get(
        request,
        AssetType.AGENT,
        agent_id,
        lambda: AgentWithStatus(
            id="",
            name="New Agent",
            usage="",
            usage_examples=[],
            status=AssetStatus.ENABLED,
            defined_in=AssetLocation.PROJECT_DIR,
            gpt_mode=GPTMode.QUALITY,
            system="",
            override=False,
        ),
    )


@router.patch("/{agent_id}")
async def agent_patch(agent_id: str, agent: Agent):
    return await asset_patch(AssetType.AGENT, agent, agent_id)


@router.post("/{agent_id}")
async def agent_post(agent_id: str, agent: Agent):
    return await asset_post(AssetType.AGENT, agent, agent_id)


@router.post("/{agent_id}/status-change")
async def agent_status_change(agent_id: str, body: StatusChangePostBody):
    await asset_status_change(AssetType.AGENT, agent_id, body)


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    try:
        await project.get_project_agents().delete_asset(agent_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Agent not found")


@router.get("/{asset_id}/exists")
async def agent_exists(request: Request, asset_id: str):
    return await asset_exists(AssetType.AGENT, request, asset_id)
