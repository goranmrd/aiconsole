import asyncio
from typing import List
from aiconsole.aic_types import AICMessage, Agent
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
import logging

log = logging.getLogger(__name__)

async def rephrase_as_message_for_agent(history: List[AICMessage], next_step: str, agent: Agent) -> str:
    system_content = f"""
You are a director of a multiple AI Agents, doing everything to help the user.
You have multiple AI Agents at your disposal, each with their own unique capabilities.
Some of them can run code on this local machine in order to perform any tasks that the user needs.

Your job is to delegate a task to one of your agents, and make sure that the user gets the best experience possible.

Tell "{agent.name}" to do whatever is needed in order to achive the next action item:

```text
{next_step}.
```

Answer with only with your direction, directed to "{agent.name}" (Agent description: "{agent.usage}").

Make sure to mention that agent by name.

Make sure that your answer is no longer than 100 characters.

Keep in mind that the agent has seen the last message, so don't repeat information from it.

Remove any formatting, such as markdown, from your answer. This is a simple chat message.
"""

    request = GPTRequest(
        messages=convert_messages(history),
        gpt_mode= GPTMode.FAST,
        system_message=system_content,
        min_tokens=100,
        preferred_tokens=200,
    )

    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(request):
        pass
    
    return gpt_executor.response.choices[0].message.content or ""

