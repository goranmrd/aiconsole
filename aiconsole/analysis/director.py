import json
import logging
from typing import List
from aiconsole import projects
from aiconsole.agents.types import Agent
from aiconsole.analysis.AnalysisResponse import AnalysisResponse
from aiconsole.analysis.create_text_plan import create_text_plan
from aiconsole.analysis.fix_plan_and_convert_to_json import fix_plan_and_convert_to_json
from aiconsole.chat.types import Chat
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode

_log = logging.getLogger(__name__)


def pick_agent(arguments: dict, chat: Chat, available_agents: List[Agent]) -> Agent:
    """
    The function pick_agent picks an agent based on the given arguments and availability of the agents.

    Parameters:
    arguments (dict): Input arguments containing the data field.
    available_agents (List[Agent]): List of available agents.
    result (str): Result from previous operations.

    Returns:
    picked_agent (Agent): The chosen agent object.
    """

    # Try support first
    default_agent = next(
        (agent for agent in available_agents if agent.id == "support"), None
    )

    # Pick any if not available
    if not default_agent:
        default_agent = available_agents[0]

    already_happened = arguments.get("already_happened", False)
    is_users_turn = arguments.get("is_users_turn", False) or already_happened

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
                if agent.id == arguments.get("agent_id", None)
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


async def director_analyse(chat: Chat) -> AnalysisResponse:
    available_agents = projects.get_project_agents().all_agents()
    available_materials = projects.get_project_materials().all_materials()

    plan = await create_text_plan(chat, available_agents, available_materials)
    arguments = await fix_plan_and_convert_to_json(
        chat, plan, available_agents, available_materials
    )

    # if arguments is a string retry to parse it as json
    if isinstance(arguments, str):
        arguments = json.loads(arguments)

    picked_agent = pick_agent(arguments, chat, available_agents)

    relevant_materials = [
        k
        for k in available_materials
        if k.id in arguments.get("needed_material_ids", [])
    ]

    # Maximum of 5 materials
    relevant_materials = relevant_materials[:5]

    return {
        "next_step": arguments.get("next_step", ""),
        "agent_id": picked_agent.id if picked_agent else None,
        "materials_ids": [material.id for material in relevant_materials],
    }
