from typing import List, Optional
from pydantic import BaseModel
from aiconsole import projects
from aiconsole.agents.types import Agent
from aiconsole.analysis.create_plan_class import create_plan_class
from aiconsole.chat.types import Chat
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import EnforcedFunctionCall, GPTMessage
from aiconsole.materials.material import Material
from aiconsole.settings import settings
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.websockets.outgoing_messages import AnalysisUpdatedWSMessage
import logging

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

    available_agents = projects.get_project_agents().all_agents()

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
    if is_users_turn and chat.messages and chat.messages[-1].role == "user":
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
        for k in projects.get_project_materials().enabled_materials()
        if k.id in relevant_material_ids
    ][:5]

    relevant_materials += projects.get_project_materials().forced_materials()

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
        messages=[*convert_messages(chat.messages), GPTMessage(
            role="system",
            content=last_system_prompt
        )],
        functions=[plan_class.openai_schema],
        presence_penalty=2,
        min_tokens=settings.DIRECTOR_MIN_TOKENS,
        preferred_tokens=settings.DIRECTOR_PREFERRED_TOKENS,
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

    relevant_materials = _get_relevant_materials(arguments.relevant_material_ids)

    return AnalysisStepWithFunctionReturnValue(
        next_step=arguments.next_step,
        picked_agent=picked_agent,
        relevant_materials=relevant_materials,
    )