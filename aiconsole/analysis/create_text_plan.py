from aiconsole.agents.types import Agent
from aiconsole.chat.types import Chat
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import GPTMessage
from aiconsole.materials.material import Material
from aiconsole.utils.convert_messages import convert_messages
from typing import List
import random
from aiconsole.settings import settings
from aiconsole.websockets.outgoing_messages import AnalysisUpdatedWSMessage


def _initial_system_prompt():
    return """
You are a director of a multiple AI Agents, doing everything to help the user.
You have multiple AI Agents at your disposal, each with their own unique capabilities.
Some of them can run code on this local machine in order to perform any tasks that the user needs.
Your job is to delegate tasks to the agents, and make sure that the user gets the best experience possible.
Never perform a task that an agent can do, and never ask the user to do something that an agent can do.
Do not answer other agents when they ask the user for something, allow the user to respond.
Be proactive, and try to figure out how to help without troubling the user.
If you spot an error in the work of an agent, suggest curreting it to the agent.
If an agent struggles with completing a task, experiment with giving him different set of materials.
If there is no meaningful next step, don't select an agent!
Your agents can only do things immediatelly, don't ask them to do something in the future.
Don't write or repeat any code, you don't know how to code.
Materials are special files that contain instructions for agents, you can choose which materials a given agent will have available, they can only use a limited number due to token limitations.
""".strip()


def _last_system_prompt(available_agents, available_materials):
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
1. Assess the current situation in the conversation, and who should now respond, the user or an agent?
2. Establish a full plan to bring value to the user
3. Briefly describe what the next, atomic, simple step of this conversation is, it can be both an action by a single agent or waiting for user response.
4. Establish who should handle the next step, it can be one of the following ids:
{random_agents}

5. Figure out and provide a list of ids of materials that are needed to execute the task, choose among the following ids:
{random_materials}
""".strip()


async def create_text_plan(
    chat: Chat, available_agents: List[Agent], available_materials: List[Material]
):
    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(
        GPTRequest(
            system_message=_initial_system_prompt(),
            gpt_mode=GPTMode.QUALITY,
            messages=[
                *convert_messages(chat.messages),
                GPTMessage(
                    role="system",
                    content=_last_system_prompt(
                        available_agents=available_agents,
                        available_materials=available_materials,
                    ),
                ),
            ],
            presence_penalty=2,
            min_tokens=settings.DIRECTOR_MIN_TOKENS,
            preferred_tokens=settings.DIRECTOR_PREFERRED_TOKENS,
        )
    ):
        await AnalysisUpdatedWSMessage(
            agent_id=None,
            relevant_material_ids=None,
            next_step=None,
            thinking_process=gpt_executor.partial_response.choices[0].message.content,
        ).send_to_chat(chat.id)

    return gpt_executor.response.choices[0].message.content or ""
