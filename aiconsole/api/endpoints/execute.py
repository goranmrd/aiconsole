import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from aiconsole import projects
import logging
from aiconsole.agents.types import ExecutionModeContext
from aiconsole.chat.types import ChatWithAgentAndMaterials
from aiconsole.materials.content_evaluation_context import ContentEvaluationContext
from aiconsole.websockets.outgoing_messages import ErrorWSMessage


router = APIRouter()
_log = logging.getLogger(__name__)


@router.post("/execute")
async def execute(chat: ChatWithAgentAndMaterials) -> StreamingResponse:
    agent = projects.get_project_agents().agents[chat.agent_id]

    content_context = ContentEvaluationContext(
        messages=chat.messages,
        agent=agent,
        gpt_mode=agent.gpt_mode,
        relevant_materials=[projects.get_project_materials().get_material(id) for id in chat.relevant_materials_ids],
    )

    rendered_materials = [await material.render(content_context) for material in content_context.relevant_materials]

    context = ExecutionModeContext(
        messages=chat.messages,
        agent=agent,
        relevant_materials=rendered_materials,
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
            await ErrorWSMessage(error=str(e)).send_to_chat(chat.id)
            raise e

    return StreamingResponse(
        async_wrapper(), media_type="text/event-stream"
    )
    
