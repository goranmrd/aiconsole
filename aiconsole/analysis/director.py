import json
import logging
from typing import List
from aiconsole.agents.agents import agents
from aiconsole.aic_types import Agent, ContentEvaluationContext, Chat
from aiconsole.analysis.AnalysisResponse import AgentDict, AnalysisResponse
from aiconsole.analysis.create_text_plan import create_text_plan
from aiconsole.analysis.fix_plan_and_convert_to_json import fix_plan_and_convert_to_json
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode
from aiconsole.materials.materials import materials

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

    already_happened = arguments.get("already_happened", False)
    is_users_turn = arguments.get("is_users_turn", False) or already_happened


    if is_users_turn:
        picked_agents = [Agent(id='user', name='User', usage='When a human user needs to respond',
                                system='', execution_mode=execution_mode_normal, gpt_mode=GPTMode.QUALITY)]
    else:
        picked_agents = [agent for agent in available_agents if agent.id == arguments.get("agent_id", None)]

    picked_agent = picked_agents[0] if picked_agents else None

    _log.debug(f"Chosen agent: {picked_agent}")

    # The "support" agent is always available
    if not picked_agent:
        picked_agent = agents.agents['support']

    # If it turns out that the user must respond to him self, have the assistant drive the conversation
    if is_users_turn and chat.messages and chat.messages[-1].role == "user":
        picked_agent = agents.agents['support']

    return picked_agent


async def director_analyse(chat: Chat) -> AnalysisResponse:
    available_agents = agents.all_agents()
    available_materials = materials.all_materials()

    plan = await create_text_plan(chat, available_agents, available_materials)
    arguments = await fix_plan_and_convert_to_json(chat, plan, available_agents, available_materials)

    # if arguments is a string retry to parse it as json
    if isinstance(arguments, str):
        arguments = json.loads(arguments)

    picked_agent = pick_agent(arguments, chat, available_agents)

    relevant_materials = [
        k for k in available_materials if k.id in arguments.get("needed_material_ids", [])]

    # Maximum of 5 materials
    relevant_materials = relevant_materials[: 5]

    return {
        "next_step": arguments.get("next_step", ""),
        "agent": AgentDict(
            **dict(
                picked_agent.model_dump()
                | {"execution_mode": picked_agent.execution_mode.__name__}
            ),
        )
        if picked_agent
        else None,
        "materials": [
            {
                "id": material.id,
                "usage": material.usage,
                "content": material.content(ContentEvaluationContext(
                    messages=chat.messages,
                    agent=picked_agent,
                    relevant_materials=relevant_materials,
                    gpt_mode=picked_agent.gpt_mode,
                )),
            }
            for material in relevant_materials
        ]
    }
