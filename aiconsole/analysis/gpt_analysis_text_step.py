from aiconsole.chat.types import Chat
from aiconsole.gpt.consts import GPTMode
from aiconsole.gpt.gpt_executor import GPTExecutor
from aiconsole.gpt.request import GPTRequest
from aiconsole.gpt.types import GPTMessage
from aiconsole.settings import settings
from aiconsole.utils.convert_messages import convert_messages
from aiconsole.websockets.outgoing_messages import AnalysisUpdatedWSMessage


async def gpt_analysis_text_step(
    chat: Chat,
    gpt_mode: GPTMode,
    initial_system_prompt: str,
    last_system_prompt: str,
):
    gpt_executor = GPTExecutor()

    request = GPTRequest(
        system_message=initial_system_prompt,
        gpt_mode=gpt_mode,
        messages=[*convert_messages(chat.messages), GPTMessage(
            role="system",
            content=last_system_prompt
        )],
        presence_penalty=2,
        min_tokens=settings.DIRECTOR_MIN_TOKENS,
        preferred_tokens=settings.DIRECTOR_PREFERRED_TOKENS,
    )

    async for chunk in gpt_executor.execute(request):
        await AnalysisUpdatedWSMessage(
            agent_id=None,
            relevant_material_ids=None,
            next_step=None,
            thinking_process=gpt_executor.partial_response.choices[0].message.content,
        ).send_to_chat(chat.id)

    return gpt_executor.response.choices[0].message.content or ""