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
    
import asyncio
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from aiconsole import projects
import logging
from aiconsole.agents.types import ExecutionModeContext
from aiconsole.chat.types import ChatWithAgentAndMaterials
from aiconsole.materials.content_evaluation_context import ContentEvaluationContext
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from aiconsole.websockets.outgoing_messages import ErrorWSMessage


router = APIRouter()
_log = logging.getLogger(__name__)


@router.post("/execute")
@cancelable_endpoint
async def execute(request: Request, chat: ChatWithAgentAndMaterials) -> StreamingResponse:
    agent = projects.get_project_agents().agents[chat.agent_id]

    content_context = ContentEvaluationContext(
        chat=chat,
        agent=agent,
        gpt_mode=agent.gpt_mode,
        relevant_materials=[projects.get_project_materials().get_material(id) for id in chat.relevant_materials_ids],
    )

    rendered_materials = [await material.render(content_context) for material in content_context.relevant_materials]

    context = ExecutionModeContext(
        chat=chat,
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
    
