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
from uuid import uuid4
from aiconsole.core.chat.chat_outgoing_messages import ResetMessageWSMessage, SequenceStage, UpdateMessageWSMessage
from aiconsole.core.assets.agents.agent import ExecutionModeContext
from aiconsole.core.execution_modes.get_agent_system_message import get_agent_system_message
from aiconsole.core.gpt.gpt_executor import GPTExecutor
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.core.gpt.create_full_prompt_with_materials import create_full_prompt_with_materials
from aiconsole.core.gpt.types import CLEAR_STR
from aiconsole.core.gpt.request import GPTRequest

_log = logging.getLogger(__name__)


async def execution_mode_normal(
    context: ExecutionModeContext,
):
    _log.debug("execution_mode_normal")

    gpt_executor = GPTExecutor()

    message_id = str(uuid4())
    await UpdateMessageWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.START,
        id=message_id,
    ).send_to_chat(context.chat.id)

    try:
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
                if message_id:
                    await ResetMessageWSMessage(
                        request_id=context.request_id,
                        id=message_id,
                    ).send_to_chat(context.chat.id)
                continue

            await UpdateMessageWSMessage(
                request_id=context.request_id,
                stage=SequenceStage.MIDDLE,
                id=message_id,
                text_delta=chunk["choices"][0]["delta"].get("content", ""),
            ).send_to_chat(context.chat.id)

    except asyncio.CancelledError:
        _log.warning("Cancelled execution_mode_normal")
    finally:
        await UpdateMessageWSMessage(
            request_id=context.request_id,
            stage=SequenceStage.END,
            id=message_id,
        ).send_to_chat(context.chat.id)
