import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from aiconsole import projects

from aiconsole.aic_types import ChatWithAgentAndMaterials, ExecutionModeContext
from aiconsole.agents import agents

import logging

from aiconsole.websockets.messages import ErrorWSMessage


router = APIRouter()
_log = logging.getLogger(__name__)


@router.post("/execute")
async def execute(chat: ChatWithAgentAndMaterials) -> StreamingResponse:
    agent = projects.get_project_agents().agents[chat.agent_id]

    context = ExecutionModeContext(
        messages=chat.messages,
        agent=agent,
        relevant_materials=chat.relevant_materials,
        gpt_mode=agent.gpt_mode,
    )

    async def async_wrapper():
        try:
            async for item in agent.execution_mode(context):
                _log.debug(item)
                yield item
        except asyncio.CancelledError:
            _log.warning("Cancelled execution_mode_interpreter")
        except Exception as e:
            await ErrorWSMessage(error=str(e)).send(chat.id)
            raise e

    return StreamingResponse(
        async_wrapper(), media_type="text/event-stream"
    )
    
