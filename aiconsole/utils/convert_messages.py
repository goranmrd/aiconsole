import json
from aiconsole.aic_types import AICMessage
from aiconsole.gpt.types import GPTFunctionCall, GPTMessage, GPTRole


from typing import List

from aiconsole.settings import settings


last_system_message = None

def convert_message(message: AICMessage) -> List[GPTMessage]:
    global last_system_message

    content = message.content
    function_call = None
    name = None
    role: GPTRole = message.role

    result = []

    #
    # Augment the messages with system messages with meta data about which agent is speaking and what materials were available
    #

    # if (message.agent_id != 'user'):
    #    system = f'next message by agent={message.agent_id} with access to materials={[(material.id  if message.materials else "None") for material in message.materials]}'

    if message.task:
        system_message = f'Agent: {message.agent_id}\nAvailable materials: {", ".join(m.id for m in message.materials) if message.materials else "None"}'
        if (last_system_message != system_message):
            result.append(GPTMessage(
                role='system',
                name='director',
                content=system_message,
            ))
            last_system_message = system_message

    if (message.code):
        function_call = GPTFunctionCall(
            name="execute",
            arguments=json.dumps({
                "code": message.content,
                "language": message.language,
            })
        )
        name = "code"
        role = 'assistant'
    elif (message.code_output):
        name = "Run"

        if (message.content == ""):
            content = "No output"

        # Enforce limit on output length, and put info that it was truncated only if limit was reached, truncate so the last part remains (not the first)
        if (len(content) > settings.FUNCTION_CALL_OUTPUT_LIMIT):
            content = f"Output truncated to last {settings.FUNCTION_CALL_OUTPUT_LIMIT} characters: \n\n...\n{content[-settings.FUNCTION_CALL_OUTPUT_LIMIT:]}"

        role = 'function'
    elif (message.agent_id != 'user'):
        name = message.agent_id

    if content:
        result.append(GPTMessage(role=role, content=content,
                      function_call=function_call, name=name))

    return result


def convert_messages(messages: List[AICMessage]) -> List[GPTMessage]:
    global last_system_message
    last_system_message = None
    # Flatten
    return [item for sublist in [convert_message(message) for message in messages] for item in sublist]
