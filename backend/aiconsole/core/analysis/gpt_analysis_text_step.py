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

from aiconsole.consts import DIRECTOR_MIN_TOKENS, DIRECTOR_PREFERRED_TOKENS
from aiconsole.core.chat.chat_outgoing_messages import SequenceStage, UpdateAnalysisWSMessage
from aiconsole.core.chat.types import Chat
from aiconsole.core.gpt.consts import GPTMode
from aiconsole.core.gpt.gpt_executor import GPTExecutor
from aiconsole.core.gpt.request import GPTRequest
from aiconsole.core.gpt.types import GPTRequestTextMessage
from aiconsole.utils.convert_messages import convert_messages


async def gpt_analysis_text_step(
    chat: Chat,
    request_id: str,
    gpt_mode: GPTMode,
    initial_system_prompt: str,
    last_system_prompt: str,
):
    gpt_executor = GPTExecutor()

    request = GPTRequest(
        system_message=initial_system_prompt,
        gpt_mode=gpt_mode,
        messages=[*convert_messages(chat), GPTRequestTextMessage(role="system", content=last_system_prompt)],
        presence_penalty=2,
        min_tokens=DIRECTOR_MIN_TOKENS,
        preferred_tokens=DIRECTOR_PREFERRED_TOKENS,
    )

    await UpdateAnalysisWSMessage(
        request_id=request_id,
        stage=SequenceStage.START,
    ).send_to_chat(chat.id)

    try:
        async for chunk in gpt_executor.execute(request):
            await UpdateAnalysisWSMessage(
                stage=SequenceStage.MIDDLE,
                request_id=request_id,
                agent_id=None,
                relevant_material_ids=None,
                next_step=None,
                thinking_process=gpt_executor.partial_response.choices[0].message.content,
            ).send_to_chat(chat.id)
    finally:
        await UpdateAnalysisWSMessage(
            request_id=request_id,
            stage=SequenceStage.END,
        ).send_to_chat(chat.id)

    return gpt_executor.response.choices[0].message.content or ""
