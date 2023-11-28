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
import importlib
import logging
from typing import cast

from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from aiconsole.core.assets.agents.agent import Agent, ExecutionModeContext
from aiconsole.core.assets.materials.material import Material
from aiconsole.core.chat.types import Chat
from aiconsole.core.assets.materials.content_evaluation_context import ContentEvaluationContext
from aiconsole.core.project import project
from aiconsole.utils.cancel_on_disconnect import cancelable_endpoint
from fastapi import APIRouter, Request
from pydantic import BaseModel, ValidationError

router = APIRouter()
_log = logging.getLogger(__name__)


class ExecuteRequestData(BaseModel):
    request_id: str
    chat: Chat
    agent_id: str
    relevant_materials_ids: list[str]


async def dynamic_import_and_call_execution_mode(agent: Agent, context):
    execution_mode = agent.execution_mode

    split = execution_mode.split(":")

    if len(split) != 2:
        raise ValueError(
            f"Invalid execution_mode in agent {agent.name}: {execution_mode} - should be module_name:object_name"
        )

    module_name, object_name = execution_mode.split(":")
    module = importlib.import_module(module_name)
    obj = getattr(module, object_name, None)

    if obj is None:
        raise ValueError(f"Could not find {object_name} in {module_name} module in agent {agent.name}")

    if not callable(obj):
        raise ValueError(f"{object_name} in {module_name} is not callable (in agent {agent.name})")

    ret_val = obj(context)

    if not asyncio.iscoroutine(ret_val):
        raise ValueError(f"{object_name} in {module_name} is not a coroutine (in agent {agent.name})")

    await ret_val


@router.post("/{chat_id}/execute")
@cancelable_endpoint
async def execute(request: Request, data: ExecuteRequestData, chat_id):
    if chat_id != data.chat.id:
        raise ValidationError("Chat ID does not match")

    agent = cast(Agent, project.get_project_agents().get_asset(data.agent_id))

    content_context = ContentEvaluationContext(
        chat=data.chat,
        agent=agent,
        gpt_mode=agent.gpt_mode,
        relevant_materials=[
            cast(Material, project.get_project_materials().get_asset(id)) for id in data.relevant_materials_ids
        ],
    )

    rendered_materials = [await material.render(content_context) for material in content_context.relevant_materials]

    context = ExecutionModeContext(
        request_id=data.request_id,
        chat=data.chat,
        agent=agent,
        relevant_materials=rendered_materials,
        gpt_mode=agent.gpt_mode,
    )

    try:
        await dynamic_import_and_call_execution_mode(agent, context)
    except asyncio.CancelledError:
        _log.warning("Cancelled execution_mode_interpreter")
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send_to_chat(data.chat.id)
        raise e
