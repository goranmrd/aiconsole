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
from typing import List, Optional

from aiconsole.api.websockets.outgoing_messages import AnalysisUpdatedWSMessage
from aiconsole.consts import DIRECTOR_MIN_TOKENS, DIRECTOR_PREFERRED_TOKENS
from aiconsole.core.agents.types import Agent
from aiconsole.core.analysis.create_plan_class import create_plan_class
from aiconsole.core.chat.types import Chat
from aiconsole.core.execution_modes.normal import execution_mode_normal
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.gpt.gpt_executor import GPTExecutor
from aiconsole.core.gpt.request import GPTRequest
from aiconsole.core.gpt.types import EnforcedFunctionCall, GPTMessage
from aiconsole.core.materials.material import Material
from aiconsole.core.project import project
from aiconsole.utils.convert_messages import convert_messages
from pydantic import BaseModel

_log = logging.getLogger(__name__)


def pick_agent(arguments, chat: Chat) -> Agent:
    """
    The function pick_agent picks an agent based on the given arguments and availability of the agents.

    Parameters:
    arguments (dict): Input arguments containing the data field.
    available_agents (List[Agent]): List of available agents.
    result (str): Result from previous operations.

    Returns:
    picked_agent (Agent): The chosen agent object.
    """

    available_agents = project.get_project_agents().all_agents()

    # Try support first
    default_agent = next(
        (agent for agent in available_agents if agent.id == "support"), None
    )

    # Pick any if not available
    if not default_agent:
        default_agent = available_agents[0]

    already_happened = arguments.already_happened
    is_users_turn = arguments.is_users_turn or already_happened

    if is_users_turn:
        picked_agent = Agent(
            id="user",
            name="User",
            usage="When a human user needs to respond",
            system="",
            execution_mode=execution_mode_normal,
            gpt_mode=GPTMode.QUALITY,
        )
    else:
        picked_agent = next(
            (
                agent
                for agent in available_agents
                if agent.id == arguments.agent_id
            ),
            None,
        )

    _log.debug(f"Chosen agent: {picked_agent}")

    if not picked_agent:
        picked_agent = default_agent

    # If it turns out that the user must respond to him self, have the assistant drive the conversation
    if is_users_turn and chat.message_groups and chat.message_groups[-1].role == "user":
        picked_agent = default_agent

    return picked_agent


class AnalysisStepWithFunctionReturnValue(BaseModel):
    next_step: str
    picked_agent: Optional[Agent] = None
    relevant_materials: List[Material] = []


def _get_relevant_materials(relevant_material_ids: List[str]) -> List[Material]:
    # Maximum of 5 materials
    relevant_materials = [
        k
        for k in project.get_project_materials().enabled_materials()
        if k.id in relevant_material_ids
    ][:5]

    relevant_materials += project.get_project_materials().forced_materials()

    return relevant_materials


async def gpt_analysis_function_step(
    chat: Chat,
    gpt_mode: GPTMode,
    initial_system_prompt: str,
    last_system_prompt: str,
    force_call: bool,
) -> AnalysisStepWithFunctionReturnValue:
    gpt_executor = GPTExecutor()

    plan_class = create_plan_class()

    request = GPTRequest(
        system_message=initial_system_prompt,
        gpt_mode=gpt_mode,
        messages=[*convert_messages(chat), GPTMessage(
            role="system",
            content=last_system_prompt
        )],
        functions=[plan_class.openai_schema],
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )

    if (force_call):
        request.function_call = EnforcedFunctionCall(name=plan_class.__name__)

    async for chunk in gpt_executor.execute(request):
        function_call = gpt_executor.partial_response.choices[0].message.function_call
        if function_call is not None:
            arguments = function_call.arguments
            if not isinstance(arguments, str):
                await AnalysisUpdatedWSMessage(
                    agent_id=arguments.get("agent_id", None),
                    relevant_material_ids=arguments.get(
                        "relevant_material_ids", None),
                    next_step=arguments.get("next_step", None),
                    thinking_process=arguments.get("thinking_process", None),
                ).send_to_chat(chat.id)
        else:
            await AnalysisUpdatedWSMessage(
                agent_id=None,
                relevant_material_ids=None,
                next_step=None,
                thinking_process=gpt_executor.partial_response.choices[0].message.content,
            ).send_to_chat(chat.id)

    result = gpt_executor.response.choices[0].message

    if result.function_call is None:
        return AnalysisStepWithFunctionReturnValue(
            next_step=result.content or ""
        )

    arguments = result.function_call.arguments

    if isinstance(arguments, str):
        raise ValueError(
            f"Could not parse arguments from the text: {arguments}")

    arguments = plan_class(**arguments)

    picked_agent = pick_agent(arguments, chat)

    relevant_materials = _get_relevant_materials(
        arguments.relevant_material_ids)

    return AnalysisStepWithFunctionReturnValue(
        next_step=arguments.next_step,
        picked_agent=picked_agent,
        relevant_materials=relevant_materials,
    )
