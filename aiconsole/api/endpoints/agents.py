import logging
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from aiconsole import projects
from aiconsole.agents.types import AgentBase
from aiconsole.gpt.consts import GPTMode

router = APIRouter()

_log = logging.getLogger(__name__)

@router.get("/agents")
async def agents_handler():
    all_agents = projects.get_project_agents().all_agents()

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