import json
import logging
from typing import List
from openai_function_call import OpenAISchema
from pydantic import Field
from aiconsole.agents.agents import agents
from aiconsole.aic_types import Agent, ContentEvaluationContext, Chat
from aiconsole.analysis.AnalysisResponse import AgentDict, AnalysisResponse
from aiconsole.execution_modes.normal import execution_mode_normal
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.types import EnforcedFunctionCall
from aiconsole.gpt.request import GPTRequest
from aiconsole.materials.materials import materials
from aiconsole.analysis.get_director_system_prompt import get_director_system_prompt, get_fixing_prompt
from aiconsole.utils.convert_messages import convert_messages

DIRECTOR_MIN_TOKENS = 250
DIRECTOR_PREFERRED_TOKENS = 1000

log = logging.getLogger(__name__)


async def director_analyse(request: Chat) -> AnalysisResponse:
    messages = request.messages

    available_agents = agents.all_agents()
    available_materials = materials.all_materials()

    # Director can suggest a user only if the last message was not from the user
    if (request.messages and request.messages[-1].role != "user"):
        available_agents = [Agent(id='user', name='User', usage='When a human user needs to respond',
                                  system='', execution_mode=execution_mode_normal, gpt_mode=GPTMode.QUALITY), *available_agents]

    class OutputSchema(OpenAISchema):
        """
        Choose needed materials and agent for the task.
        """

        thinking_process: str = Field(
            description="Short description of the thinking process that led to the next step.",
            json_schema_extra={"type": "string"}
        )

        next_step: str = Field(
            description="A short actionable description of the next single atomic task to move this conversation forward.",
            json_schema_extra={"type": "string"}
        )

        agent_id: str = Field(
            ...,
            description="Chosen agent to perform the next step, can also be the user.",
            json_schema_extra={"enum": [s.id for s in available_agents]},
        )

        needed_material_ids: List[str] = Field(
            ...,
            description="Chosen material ids needed for the task",
            json_schema_extra={
                "items": {"enum": [k.id for k in available_materials], "type": "string"}
            },
        )

    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(GPTRequest(
        system_message=get_director_system_prompt(
            available_agents=available_agents,
            available_materials=available_materials,
        ),
        gpt_mode=GPTMode.FAST,
        messages=convert_messages(messages),
        functions=[OutputSchema.openai_schema],
        function_call=EnforcedFunctionCall(name="OutputSchema"),
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )):
        pass

    result = gpt_executor.response
    function_call = result.choices[0].message.function_call

    if gpt_executor.response.choices[0].message.content:
        raise ValueError(gpt_executor.response.choices[0].message.content)

    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(GPTRequest(
        system_message=get_fixing_prompt(
            available_agents=available_agents,
            available_materials=available_materials,
            proposed_solution=function_call.arguments if function_call else "",
        ),
        gpt_mode=GPTMode.QUALITY,
        messages=convert_messages(messages),
        functions=[OutputSchema.openai_schema],
        function_call=EnforcedFunctionCall(name="OutputSchema"),
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )):
        pass

    result = gpt_executor.response
    function_call2 = result.choices[0].message.function_call


    log.info((function_call.arguments if function_call else ""))
    log.info(" ----> ")
    log.info((function_call2.arguments if function_call2 else ""))

    if result.choices[0].message.function_call is None:
        raise ValueError(
            f"Could not find function call in the text: {result}")

    raw_arguments = result.choices[0].message.function_call.arguments
    arguments = json.loads(raw_arguments, strict=False)

    picked_agents = [
        agent for agent in available_agents if agent.id == arguments["agent_id"]]
    picked_agent = picked_agents[0] if picked_agents else None

    log.debug(f"Chosen agent: {picked_agent}")

    if not picked_agent:
        log.error(f"Could not find agent in the text: {result}")
        picked_agent = available_agents[0]

    # TODO raw_arguments might not be accurate to check which materials are needed
    relevant_materials = [
        k for k in available_materials if k.id in raw_arguments]

    # Maximum of 5 materials
    relevant_materials = relevant_materials[: 5]

    task_context = ContentEvaluationContext(
        messages=request.messages,
        agent=picked_agent,
        relevant_materials=relevant_materials,
        gpt_mode=picked_agent.gpt_mode,
    )

    next_step = arguments["next_step"] if "next_step" in arguments else ""

    if picked_agent.id != "user":
        real_next_step = next_step
    else:
        real_next_step = ""

    analysis: AnalysisResponse = {
        "next_step": real_next_step,
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
                "content": material.content(task_context),
            }
            for material in relevant_materials
        ]
    }
    log.debug(analysis)

    return analysis
