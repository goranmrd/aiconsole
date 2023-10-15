import random
from aiconsole.agents.types import Agent
from aiconsole.chat.types import Chat
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import EnforcedFunctionCall, GPTMessage
from aiconsole.materials.material import Material
from aiconsole.utils.convert_messages import convert_messages
from openai_function_call import OpenAISchema
from pydantic import Field
from typing import List
from aiconsole.settings import settings


def _initial_system_prompt(available_agents, available_materials):
    new_line = "\n"

    random_agents = new_line.join(
        [
            f"* {c.id} - {c.usage}"
            for c in random.sample(available_agents, len(available_agents))
        ]
    )

    random_materials = (
        new_line.join(
            [
                f"* {c.id} - {c.usage}"
                for c in random.sample(available_materials, len(available_materials))
            ]
        )
        if available_materials
        else ""
    )

    return f"""
You are a director of a multiple AI Agents, doing everything to help the user.
You have multiple AI Agents at your disposal, each with their own unique capabilities.
Some of them can run code on this local machine in order to perform any tasks that the user needs.
Your job is to delegate tasks to the agents, and make sure that the user gets the best experience possible.
Never perform a task that an agent can do, and never ask the user to do something that an agent can do.
Do not answer other agents when they ask the user for something, allow the user to respond.
Materials are special files that contain instructions for agents, you can choose which materials a given agent will have available, they can only use a limited number due to token limitations.

# Agents
You have the following agents available to handle the next step of this conversation, it can be one of the following ids (if next step is for user to respond, it should be 'user'):
{random_agents}


# Materials
A list of ids of materials that are needed to execute the task, make sure that the agent has a prioritised list of those materials to look at, agents are not able to read all of them nor change your choice:
{random_materials}

""".strip()


def _last_system_prompt(proposed_solution: str):
    return f"""
You have following analysis of the current situation:

# Analysis
{proposed_solution}


# Job

Your job is to prepare a new better plan.

- Is there a next step phrased as a next step, and a task for a given agent?
- Is there a better next step for this task?
- Are there any missing materials that could be useful for this task, that this solution does not have?
- Are there any materials that are not needed for this task, that this solution has?
- Are the materials sorted in an order of importance?
- Are you not repeating previous tasks and activity and delegating it to the same agent? Don't expect to get different results if you do the same thing again.
- Is there a better agent for this task?
- Is there a better way to describe the task?
- Is there anything that that might be a next task do that the user might find valuable? Are you trying to figure out how to help without troubling the user.
- Has an agent made an error in the last messages of the current conversation? If so maybe try to correct it with a different task, different agent or a different set of manuals?
- If you are stuck you may always ask one agent to provide an expert critique of the current situation.
- Is the next step and agent correlated and choosen apropriatelly?
- If the next step is on the user, make sure that is_users_turn is True
- Does the solution contain a task for an agent? or is it an answer to the user? it should always be phrased as a task, and the answer should be given by the agent, not the director.
- Is the next step atomic?
- Is the next step the next logical step in this conversation?
- The next step should be either a single action for a single agent or a waiting for user response. If it's the latter, the agent selected should be the 'user'.

Now fix the solution.
""".strip()


async def fix_plan_and_convert_to_json(
    request: Chat,
    text_plan: str,
    available_agents: List[Agent],
    available_materials: List[Material]
):
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

        already_happened: bool = Field(
            ...,
            description="True if what is described in the 'next_step' have already happened during this conversation.",
            json_schema_extra={"type": "boolean"}
        )

    async for chunk in gpt_executor.execute(GPTRequest(
        system_message=_initial_system_prompt(
            available_agents=available_agents,
            available_materials=available_materials,
        ),
        gpt_mode=GPTMode.QUALITY,
        messages=[*convert_messages(request.messages), GPTMessage(
            role="system",
            content=_last_system_prompt(text_plan)
        )],
        functions=[Plan.openai_schema],
        function_call=EnforcedFunctionCall(
            name="Plan"),
        presence_penalty=2,
        min_tokens=settings.DIRECTOR_MIN_TOKENS,
        preferred_tokens=settings.DIRECTOR_PREFERRED_TOKENS,
    )):
        pass

    result = gpt_executor.response

    if result.choices[0].message.function_call is None:
        raise ValueError(
            f"Could not find function call in the text: {result}")

    return result.choices[0].message.function_call.arguments
