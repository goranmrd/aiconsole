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

from aiconsole.core.assets.agents.agent import Agent, AgentWithStatus
from aiconsole.core.assets.asset import AssetLocation, AssetStatus, AssetType
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.project import project
from aiconsole.core.settings.project_settings import get_aiconsole_settings
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


class StatusChangePostBody(BaseModel):
    status: AssetStatus
    to_global: bool


@router.get("/{agent_id}")
async def agent_get(agent_id: str):
    try:
        settings = get_aiconsole_settings()
        agent = project.get_project_agents().get_asset(agent_id)
        return JSONResponse({
            **agent.model_dump(),
            "status": settings.get_asset_status(AssetType.AGENT, agent.id),
        })
    except KeyError:
        # A new agent
        return JSONResponse(AgentWithStatus(
            id="",
            name="",
            usage="",
            usage_examples=[],
            status=AssetStatus.ENABLED,
            defined_in=AssetLocation.PROJECT_DIR,
            gpt_mode=GPTMode.QUALITY,
            system=""
        ).model_dump())


@router.patch("/{agent_id}")
async def agent_patch(agent_id: str, agent: Agent):
    try:
        await project.get_project_agents().save_asset(agent, new=False, old_asset_id=agent_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{agent_id}")
async def agent_post(agent_id: str, agent: Agent):
    try:
        await project.get_project_agents().save_asset(agent, new=True, old_asset_id=agent_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return JSONResponse({"status": "ok"})


@router.post("/{agent_id}/status-change")
async def agent_status_change(
    agent_id: str,
    body: StatusChangePostBody
):
    """
    Change the status of a agent.

    Args:
        agent_id (str): The ID of the agent.
        body (StatusChangePostBody): POST body, only with "status"

    Returns:
        JSONResponse: JSON response indicating the result.
    """
    try:
        project.get_project_agents().get_asset(agent_id)
        get_aiconsole_settings().set_asset_status(
            AssetType.AGENT,
            id=agent_id, status=body.status, to_global=body.to_global
        )
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Agent not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{agent_id}")
async def delete_agent(agent_id: str):
    try:
        project.get_project_agents().delete_asset(agent_id)
        return JSONResponse({"status": "ok"})
    except KeyError:
        raise HTTPException(status_code=404, detail="Agent not found")
