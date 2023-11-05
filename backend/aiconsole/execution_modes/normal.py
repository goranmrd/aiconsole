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
    
import asyncio
import logging
from typing import AsyncGenerator
from aiconsole.agents.types import ExecutionModeContext
from aiconsole.execution_modes.get_agent_system_message import get_agent_system_message
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.gpt.create_full_prompt_with_materials import create_full_prompt_with_materials
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
            messages=convert_messages(context.chat),
            gpt_mode=context.gpt_mode,
            system_message=create_full_prompt_with_materials(
                intro=get_agent_system_message(context.agent),
                materials=context.relevant_materials,
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
