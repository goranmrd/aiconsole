import asyncio
import logging
from typing import AsyncGenerator

from aiconsole.aic_types import ExecutionModeContext
from aiconsole.execution_modes.get_agent_system_message import get_agent_system_message
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.gpt.create_full_prompt_from_sections import create_full_prompt_from_sections
from aiconsole.gpt.types import CLEAR_STR
from aiconsole.gpt.request import GPTRequest

_log = logging.getLogger(__name__)


async def execution_mode_normal(
    context: ExecutionModeContext,
) -> AsyncGenerator[str, None]:
    _log.debug("execution_mode_normal")

    gpt_executor = GPTExecutor()

    async for chunk in gpt_executor.execute(
        GPTRequest(
            messages=convert_messages(context.messages),
            gpt_mode=context.gpt_mode,
            system_message=create_full_prompt_from_sections(
                intro=get_agent_system_message(context.agent),
                sections=context.relevant_materials,
            ),
            min_tokens=250,
            preferred_tokens=2000,
        )
    ):
        if chunk == CLEAR_STR:
            yield chunk
            continue

        try:
            yield chunk["choices"][0]["delta"].get("content", "")
        except asyncio.CancelledError:
            _log.warning("Cancelled execution_mode_normal")
            break
