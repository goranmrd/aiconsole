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
import traceback
from uuid import uuid4

from aiconsole.api.websockets.outgoing_messages import ErrorWSMessage
from aiconsole.core.assets.agents.agent import ExecutionModeContext
from aiconsole.core.chat.chat_outgoing_messages import (
    SequenceStage,
    UpdateMessageWSMessage,
    UpdateToolCallOutputWSMessage,
    UpdateToolCallWSMessage,
)
from aiconsole.core.code_running.run_code import get_code_interpreter

_log = logging.getLogger(__name__)


async def execution_mode_example_countdown(
    context: ExecutionModeContext,
):
    last_message = "print('Hello world!')"

    message_id = str(uuid4())
    await UpdateMessageWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.START,
        id=message_id,
        text_delta=f"This is a demo of execution mode. I will count down from 10 to 1 and then hello world code.\n\n",
    ).send_to_chat(context.chat.id)

    for i in range(10, 0, -1):
        await UpdateMessageWSMessage(
            request_id=context.request_id, stage=SequenceStage.MIDDLE, id=message_id, text_delta=f"{i}..."
        ).send_to_chat(context.chat.id)
        await asyncio.sleep(1)

    await UpdateMessageWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.END,
        id=message_id,
    ).send_to_chat(context.chat.id)

    await asyncio.sleep(1)

    message_id = str(uuid4())
    await UpdateMessageWSMessage(
        request_id=context.request_id, stage=SequenceStage.START, id=message_id, text_delta=f"Done"
    ).send_to_chat(context.chat.id)

    await UpdateMessageWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.END,
        id=message_id,
    ).send_to_chat(context.chat.id)

    tool_call_id = str(uuid4())

    await UpdateToolCallWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.START,
        id=tool_call_id,
        code_delta=last_message,
        language="python",
    ).send_to_chat(context.chat.id)

    await UpdateToolCallWSMessage(
        request_id=context.request_id,
        stage=SequenceStage.END,
        id=tool_call_id,
    ).send_to_chat(context.chat.id)

    await UpdateToolCallOutputWSMessage(
        request_id=context.request_id, stage=SequenceStage.START, id=tool_call_id
    ).send_to_chat(context.chat.id)

    try:
        mats = context.relevant_materials

        try:
            async for token in get_code_interpreter("python").run(last_message, []):  # TODO add materials
                await UpdateToolCallOutputWSMessage(
                    request_id=context.request_id,
                    stage=SequenceStage.MIDDLE,
                    id=tool_call_id,
                    output_delta=token,
                ).send_to_chat(context.chat.id)
        except asyncio.CancelledError:
            get_code_interpreter("python").terminate()
            raise
        except Exception:
            await ErrorWSMessage(error=traceback.format_exc().strip()).send_to_chat(context.chat.id)
            await UpdateToolCallOutputWSMessage(
                request_id=context.request_id,
                stage=SequenceStage.MIDDLE,
                id=tool_call_id,
                output_delta=traceback.format_exc().strip(),
            ).send_to_chat(context.chat.id)
    except Exception as e:
        await ErrorWSMessage(error=str(e)).send_to_chat(context.chat.id)
        raise e
    finally:
        await UpdateToolCallOutputWSMessage(
            request_id=context.request_id, stage=SequenceStage.END, id=tool_call_id
        ).send_to_chat(context.chat.id)
