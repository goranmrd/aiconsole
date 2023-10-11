import datetime
import json
import logging
from typing import List
import uuid
from openai_function_call import OpenAISchema
from pydantic import Field
from aiconsole.agents.agents import agents
from aiconsole.aic_types import AICMessage, Agent, ContentEvaluationContext, Chat, Material
from aiconsole.analysis.AnalysisResponse import AgentDict, AnalysisResponse
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.types import EnforcedFunctionCall
from aiconsole.gpt.request import GPTRequest
from aiconsole.materials.materials import materials
from aiconsole.analysis.get_director_system_prompt import final_message, get_director_system_prompt, get_fixing_prompt
from aiconsole.utils.convert_messages import convert_messages

DIRECTOR_MIN_TOKENS = 250
DIRECTOR_PREFERRED_TOKENS = 1000

_log = logging.getLogger(__name__)


def pick_agent(arguments: dict, available_agents: List[Agent]) -> Agent:
  """
  The function pick_agent picks an agent based on the given arguments and availability of the agents. 

  Parameters:
    arguments (dict): Input arguments containing the data field.
    available_agents (List[Agent]): List of available agents.
    result (str): Result from previous operations.
    
  Returns:
    picked_agent (Agent): The chosen agent object.
  """

  if arguments.get("is_users_turn", False):
      picked_agents = [Agent(id='user', name='User', usage='When a human user needs to respond',
                                system='', execution_mode=execution_mode_normal, gpt_mode=GPTMode.QUALITY)]
  else:
      picked_agents = [agent for agent in available_agents if agent.id == arguments.get("agent_id", None)]

  picked_agent = picked_agents[0] if picked_agents else None

  _log.debug(f"Chosen agent: {picked_agent}")

  if not picked_agent:
      picked_agent = available_agents[0]

  return picked_agent


async def fix_plan_and_convert_to_json(request: Chat, text_plan: str, available_agents: List[Agent], available_materials: List[Material]):
    gpt_executor = GPTExecutor()

    class Plan(OpenAISchema):

        """
        Plan what should happen next.
        """

        thinking_process: str = Field(
            description="Short description of the thinking process that led to the next step.",
            json_schema_extra={"type": "string"}
        )

        next_step: str = Field(
            description="A short actionable description of the next single atomic task to move this conversation forward.",
            json_schema_extra={"type": "string"}
        )

        is_users_turn: bool = Field(
            ...,
            description="Whether the initiative is on the user side or on assistant side.",
            json_schema_extra={"type": "boolean"}
        )

        agent_id: str = Field(
            description="Chosen agent to perform the next step.",
            json_schema_extra={"enum": [s.id for s in available_agents]},
        )

        needed_material_ids: List[str] = Field(
            ...,
            description="Chosen material ids needed for the task",
            json_schema_extra={
                "items": {"enum": [k.id for k in available_materials], "type": "string"}
            },
        )

    async for chunk in gpt_executor.execute(GPTRequest(
        system_message=get_fixing_prompt(
            available_agents=available_agents,
            available_materials=available_materials,
        ),
        gpt_mode=GPTMode.FAST,
        messages=convert_messages([*request.messages, AICMessage(
            id= str(uuid.uuid4()),
            agent_id="system",
            timestamp=datetime.datetime.now().isoformat(),
            materials=[],
            role="system",
            content=final_message(text_plan)
        )]),
        functions=[Plan.openai_schema],
        function_call=EnforcedFunctionCall(
            name="Plan"),
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )):
        pass

    result = gpt_executor.response

    if result.choices[0].message.function_call is None:
        raise ValueError(
            f"Could not find function call in the text: {result}")

    return result.choices[0].message.function_call.arguments

async def create_text_plan(request: Chat, available_agents: List[Agent], available_materials: List[Material]):
    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(GPTRequest(
        system_message=get_director_system_prompt(
            available_agents=available_agents,
            available_materials=available_materials,
        ),
        gpt_mode=GPTMode.FAST,
        messages=convert_messages(request.messages),
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )):
        pass

    return gpt_executor.response.choices[0].message.content or ''


async def director_analyse(chat: Chat) -> AnalysisResponse:
    available_agents = agents.all_agents()
    available_materials = materials.all_materials()

    plan = await create_text_plan(chat, available_agents, available_materials)
    arguments = await fix_plan_and_convert_to_json(chat, plan, available_agents, available_materials)

    # if arguments is a string retry to parse it as json
    if isinstance(arguments, str):
        arguments = json.loads(arguments)

    picked_agent = pick_agent(arguments, available_agents)

    # If it turns out that the user must respond to him self, have the assistant drive the conversation
    if arguments.get("is_users_turn", False) and chat.messages and chat.messages[-1].role == "user":
        picked_agent = agents.agents['support']

    relevant_materials = [
        k for k in available_materials if k.id in json.dumps(arguments)]

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
