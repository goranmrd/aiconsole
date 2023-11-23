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
from typing import List, Optional, cast

from aiconsole.consts import DIRECTOR_MIN_TOKENS, DIRECTOR_PREFERRED_TOKENS
from aiconsole.core.analysis.agents_to_choose_from import agents_to_choose_from
from aiconsole.core.analysis.create_plan_class import create_plan_class
from aiconsole.core.assets.agents.agent import Agent
from aiconsole.core.assets.asset import AssetLocation, AssetStatus
from aiconsole.core.assets.materials.material import Material
from aiconsole.core.chat.chat_outgoing_messages import SequenceStage, UpdateAnalysisWSMessage
from aiconsole.core.chat.types import Chat
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.gpt.gpt_executor import GPTExecutor
from aiconsole.core.gpt.request import GPTRequest, ToolDefinition, ToolFunctionDefinition
from aiconsole.core.gpt.types import EnforcedFunctionCall, EnforcedFunctionCallFuncSpec, GPTRequestTextMessage
from aiconsole.core.project import project
from aiconsole.utils.convert_messages import convert_messages

_log = logging.getLogger(__name__)


def pick_agent(arguments, chat: Chat, available_agents: list[Agent]) -> Agent:
    # Try support first
    default_agent = next((agent for agent in available_agents if agent.id == "assistant"), None)

    # Pick any if not available
    if not default_agent:
        default_agent = available_agents[0]

    is_users_turn = arguments.is_users_turn

    if is_users_turn:
        picked_agent = Agent(
            id="user",
            name="User",
            usage="When a human user needs to respond",
            usage_examples=[],
            system="",
            defined_in=AssetLocation.AICONSOLE_CORE,
            gpt_mode=GPTMode.QUALITY,
            override=False,
        )
    else:
        picked_agent = next(
            (agent for agent in available_agents if agent.id == arguments.agent_id),
            None,
        )

    _log.debug(f"Chosen agent: {picked_agent}")

    if not picked_agent:
        picked_agent = default_agent

    # If it turns out that the user must respond to him self, have the assistant drive the conversation
    if is_users_turn and chat.message_groups and chat.message_groups[-1].role == "user":
        picked_agent = default_agent

    return picked_agent


def _get_relevant_materials(relevant_material_ids: List[str]) -> List[Material]:
    # Maximum of 5 materials
    relevant_materials = [
        cast(Material, k)
        for k in project.get_project_materials().assets_with_status(AssetStatus.ENABLED)
        if k.id in relevant_material_ids
    ][:5]

    relevant_materials += cast(list[Material], project.get_project_materials().assets_with_status(AssetStatus.FORCED))

    return relevant_materials


async def gpt_analysis_function_step(
    chat: Chat,
    request_id: str,
    gpt_mode: GPTMode,
    initial_system_prompt: str,
    last_system_prompt: str,
    force_call: bool,
):
    gpt_executor = GPTExecutor()

    # Pick from forced or enabled agents if no agent is forced
    possible_agent_choices = agents_to_choose_from()

    if len(possible_agent_choices) == 0:
        raise ValueError("No active agents")

    plan_class = create_plan_class(
        [
            Agent(
                id="user",
                name="User",
                usage="When a human user needs to respond",
                usage_examples=[],
                system="",
                defined_in=AssetLocation.AICONSOLE_CORE,
                override=False,
            ),
            *possible_agent_choices,
        ]
    )

    request = GPTRequest(
        system_message=initial_system_prompt,
        gpt_mode=gpt_mode,
        messages=[*convert_messages(chat), GPTRequestTextMessage(role="system", content=last_system_prompt)],
        tools=[ToolDefinition(type="function", function=ToolFunctionDefinition(**plan_class.openai_schema))],
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )

    if force_call:
        request.tool_choice = EnforcedFunctionCall(
            type="function", function=EnforcedFunctionCallFuncSpec(name=plan_class.__name__)
        )

    await UpdateAnalysisWSMessage(request_id=request_id, stage=SequenceStage.START).send_to_chat(chat.id)

    try:
        async for chunk in gpt_executor.execute(request):
            if len(gpt_executor.partial_response.choices) > 0:
                tool_calls = gpt_executor.partial_response.choices[0].message.tool_calls
                for tool_call in tool_calls:
                    function_call = tool_call.function
                    arguments = function_call.arguments
                    if not isinstance(arguments, str):
                        await UpdateAnalysisWSMessage(
                            stage=SequenceStage.MIDDLE,
                            request_id=request_id,
                            agent_id=arguments.get("agent_id", None),
                            relevant_material_ids=arguments.get("relevant_material_ids", None),
                            next_step=arguments.get("next_step", None),
                            thinking_process=arguments.get("thinking_process", None),
                        ).send_to_chat(chat.id)
                if not tool_calls:
                    await UpdateAnalysisWSMessage(
                        stage=SequenceStage.MIDDLE,
                        request_id=request_id,
                        agent_id=None,
                        relevant_material_ids=None,
                        next_step=None,
                        thinking_process=gpt_executor.partial_response.choices[0].message.content,
                    ).send_to_chat(chat.id)
            else:
                _log.warning("No choices in partial response")
                _log.warning(chunk)

        result = gpt_executor.response.choices[0].message

        if len(result.tool_calls) == 0:
            await UpdateAnalysisWSMessage(
                request_id=request_id,
                next_step=result.content or "",
                stage=SequenceStage.MIDDLE,
            ).send_to_chat(chat.id)
            return

        if len(result.tool_calls) > 1:
            raise ValueError(f"Expected one tool call, got {len(result.tool_calls)}")

        arguments = result.tool_calls[0].function.arguments

        if isinstance(arguments, str):
            raise ValueError(f"Could not parse arguments from the text: {arguments}")

        arguments = plan_class(**arguments)

        picked_agent = pick_agent(arguments, chat, possible_agent_choices)

        relevant_materials = _get_relevant_materials(arguments.relevant_material_ids)

        await UpdateAnalysisWSMessage(
            request_id=request_id,
            next_step=arguments.next_step,
            agent_id=picked_agent.id,
            relevant_material_ids=[material.id for material in relevant_materials],
            stage=SequenceStage.MIDDLE,
        ).send_to_chat(chat.id)
    finally:
        await UpdateAnalysisWSMessage(
            request_id=request_id,
            stage=SequenceStage.END,
        ).send_to_chat(chat.id)
